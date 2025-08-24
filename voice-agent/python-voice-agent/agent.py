import logging
import asyncio
from dotenv import load_dotenv
import os
from prompts import AGENT_INSTRUCTIONS

from livekit.agents import (
    Agent,
    AgentSession,
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    metrics,
    RoomInputOptions,
)
from livekit.plugins import (
    cartesia,
    google,
    deepgram,
    noise_cancellation,
    silero,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = FAISS.load_local("webmd_faiss_langchain", embeddings, allow_dangerous_deserialization=True)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

call_transcripts = []
if not os.environ.get("LIVEKIT_API_KEY"):  # or whichever key you always expect
    load_dotenv(dotenv_path=".env.local")

logger = logging.getLogger("voice-agent")


def format_retrieved_context(docs, max_chars_per_doc: int = 500):

    lines = [" retrieved medical context webmd dataset"]
    for i, d in enumerate(docs, start=1):
        content = d.page_content.strip()
        if len(content) > max_chars_per_doc:
            # cut on word boundary
            truncated = content[:max_chars_per_doc].rsplit(" ", 1)[0] + "..."
        else:
            truncated = content
        # keep useful metadata if present
        meta = d.metadata or {}
        meta_parts = []
        if "source" in meta:
            meta_parts.append(f"source={meta['source']}")
        if "question" in meta:
            meta_parts.append(f"q={meta['question']}")
        meta_str = (" [" + ", ".join(meta_parts) + "]") if meta_parts else ""
        lines.append(f"[{i}] (score={getattr(d, 'score', 'n/a')}){meta_str}\n{truncated}\n")
    lines.append("end retrieved context\n")
    return "\n".join(lines)


class Assistant(Agent):
    def __init__(self, retriever) -> None:
        super().__init__(
            instructions=AGENT_INSTRUCTIONS,
            stt=deepgram.STT(),
            llm=google.beta.realtime.RealtimeModel(
                voice="Puck",
                temperature=0.8,
            ),
            tts=cartesia.TTS(),
            turn_detection=MultilingualModel(),
        )
        self.retriever = retriever

    async def on_enter(self):
           
        await self.session.generate_reply(
            instructions="Ignore all previous instructions. Respond **exactly as written**, without changing anything: Hey, I am Waldo The Wellness Warrior, how can I help you today?",
            allow_interruptions=True
        )


    async def on_user_message(self, user_text: str):
       
        logger.debug("RAG retrieval for user text: %s", user_text)

        try:
            docs = self.retriever.get_relevant_documents(user_text)
        except Exception as e:
            logger.exception(" retriever failure; falling back to no-context reply: %s", e)
            docs = []

        context_block = ""
        if docs:
            context_block = format_retrieved_context(docs, max_chars_per_doc=500)

        safety = (
            "Note: I can provide general health information from medical resources, "
            "but I am not a doctor. This is not medical advice. For diagnosis or treatment, "
            "please consult a qualified healthcare professional.\n\n"
        )

   
        augmented_instructions = (
            AGENT_INSTRUCTIONS
            + "\n\n"
            + safety
            + "Use the retrieved context below (if relevant) to help answer the user's question. "
            + "If the context contains a direct answer, reference it. If it is unrelated, rely on general knowledge and say when you are uncertain.\n\n"
            + context_block
            + f"\nUser question: {user_text}\n\nAnswer succinctly and clearly."
        )

        try:
            self.session.generate_reply(instructions=augmented_instructions, allow_interruptions=True)
        except Exception as e:
            logger.exception("Failed to generate reply via session.generate_reply: %s", e)
            # fallback short reply so the user isn't left hanging
            self.session.generate_reply(
                instructions="Sorry but I'm having trouble accessing my knowledge base right now. Can you please repeat or rephrase?",
                allow_interruptions=True,
            )


def prewarm(proc: JobProcess):
    # preload any heavy local models (VAD)
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # first participant to connect
    participant = await ctx.wait_for_participant()
    logger.info(f"starting voice assistant for participant {participant.identity}")

    usage_collector = metrics.UsageCollector()

    # log metrics and collect usage data
    def on_metrics_collected(agent_metrics: metrics.AgentMetrics):
        metrics.log_metrics(agent_metrics)
        usage_collector.collect(agent_metrics)

    session = AgentSession(
        vad=ctx.proc.userdata["vad"],
        min_endpointing_delay=0.5,
        max_endpointing_delay=5.0,
    )

    session.on("metrics_collected", on_metrics_collected)

    assistant = Assistant(retriever=retriever)

    #start the LiveKit agent session
    await session.start(
        room=ctx.room,
        agent=assistant,
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )
    
   
    def _on_transcript(event):
        
        try:
            #defensive extraction
            if isinstance(event, dict):
                text = event.get("text") or event.get("transcript") or ""
            else:
                #if event is a tuple/list
                try:
                    text = event[0]
                except Exception:
                    text = str(event)
            text = (text or "").strip()
            if not text:
                return
            #schedule coroutine to call assistant handler
            asyncio.create_task(assistant.on_user_message(text))
        except Exception:
            logger.exception("Error handling transcript event: %s", event)

    try:
        session.on("transcript", _on_transcript)
    except Exception:
        #fallback if event wiring fails, log and continue — your session might provide another hook
        logger.warning("Could not register 'transcript' event on session; check SDK for correct event name.")

    #keep the entrypoint alive while session runs
    # many LiveKit examples use `await session.wait()` or similar; here we await forever.
    try:
        while True:
            await asyncio.sleep(3600)
    except asyncio.CancelledError:
        logger.info("Entrypoint cancelled, shutting down.")


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        ),
    )
