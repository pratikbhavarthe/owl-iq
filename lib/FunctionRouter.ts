// router.ts
"use server"

// Helper function to call local Python API
async function callPythonAPI(endpoint: string, payload: object) {
  const response = await fetch(`http://localhost:8000/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Python API error: ${response.statusText}`);
  }

  return await response.json();
}

// Helper function to perform web search (stub for now)
async function searchWeb(query: string): Promise<string> {
  // Later you can integrate an actual search API like SerpAPI, Google, Bing, etc.
  // For now, we just simulate a dummy result.
  return `Search results for "${query}" (dummy result)`;
}

// Helper function to call the chat agent API
async function chatAgent(prompt: string): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content || "No response";
  } catch (error) {
    console.error("Chat agent error:", error);
    return "Failed to get response from chat agent.";
  }
}

// Main router function that handles user prompts
export async function handleUserPrompt(prompt: string) {
  const isAction = /drill|move|fetch|lift|scan/i.test(prompt);
  const isSearch = /search|find|what|how|who|where/i.test(prompt);

  try {
    if (isAction) {
      // Validate skill/task `````````````````````````````````````
      const validation = await callPythonAPI("validate", { prompt });

      if (!validation.is_valid) {
        return {
          type: "validation",
          message: `Missing parameters: ${validation.missing.join(", ")}`
        };
      }

      // Plan and execute
      const plan = await callPythonAPI("plan", { prompt });
      const execution = await callPythonAPI("execute_skill", { task: plan });

      return {
        type: "function",
        message: `✅ Skill executed: ${execution.details}`
      };
    } else if (isSearch) {
      // Handle search queries
      const searchResult = await searchWeb(prompt);
      return { type: "search", message: searchResult };
    } else {
      // Handle general conversation
      const chatResponse = await chatAgent(prompt);
      return { type: "chat", message: chatResponse };
    }
  } catch (error: any) {
    console.error("Error handling user prompt:", error);
    return {
      type: "error",
      message: "An error occurred while processing your request."
    };
  }
}