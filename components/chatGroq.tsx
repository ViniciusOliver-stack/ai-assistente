import { useState } from "react"

export function GroqChat() {
  const [isLoading, setLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState("")
  const agentId = "cm2mka1xy0000y2syxg2mscgy"

  const handleSubmit = async (event) => {
    event?.preventDefault()
    try {
      setLoading(true)
      const response = await fetch("/api/groq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content.value, agentId }),
      })

      const data = await response.json()
      setAiResponse(data.content)
    } catch (error) {
      console.error("Ops, houve um erro: ", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-0">
      <form
        onSubmit={handleSubmit}
        className="mt-4 p-2 sm:p-4 bg-white rounded-lg shadow-lg space-x-2"
      >
        <input
          type="text"
          id="content"
          placeholder="Ask me something..."
          className="border border-gray-300 rounded-lg p-2 max-w-[200px] sm:max-w-none focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`${
            isLoading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-red-400 hover:bg-red-500"
          } text-white px-4 py-2 rounded-lg focus:outline-none text-sm sm:text-base`}
        >
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </form>
      {aiResponse && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-lg max-w-[400px]">
          <h2 className="text-lg font-semibold text-red-400">AI Response</h2>
          <p className="text-gray-600 max-h-80 overflow-y-auto  ">
            {aiResponse}
          </p>
        </div>
      )}
    </main>
  )
}
