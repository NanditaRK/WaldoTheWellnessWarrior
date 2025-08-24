"use client"
import React, { useEffect, useState } from 'react'

const PastCallsDashboard = () => {
  const [calls, setCalls] = useState<any[]>([]); 
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    // Fetch calls on component mount
    const fetchCalls = async () => {
      try {
        const response = await fetch('/api/calls'); 
        if (!response.ok) {
          throw new Error('Failed to fetch calls');
        }
        const data = await response.json();
        setCalls(data); 
      } catch (err) {
        setError('Error fetching calls');
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="bg-accent p-8 w-3/4 mx-auto rounded-4xl h-1/2 overflow-scroll">
      <h1 className="font-extrabold text-3xl">Past Calls Summary</h1>

      {calls.length > 0 ? (
        <div className="m-8">
          {calls.map((call: any) => (
            <div key={call.id} className="mb-4">
              <h3 className="text-black dark:text-primary font-bold text-2xl">{new Date(call.createdAt).toLocaleDateString()}</h3>
              <p className="text-lg">{call.summary}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No past calls found.</p>
      )}
    </div>
  );
}

export default PastCallsDashboard;
