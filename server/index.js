import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Calculate number of days from today until deadline
function getDaysUntilDeadline(deadline) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(`${deadline}T00:00:00`);
  endDate.setHours(0, 0, 0, 0);

  const difference = endDate.getTime() - today.getTime();

  const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

  return Math.max(1, days + 1);
}

app.post("/api/generate-plan", async (req, res) => {
  try {
    const { goal, hours, deadline } = req.body;

    // Validate input
    if (!goal || !hours || !deadline) {
      return res.status(400).json({
        error: "Goal, hours and deadline are required.",
      });
    }

    const dailyHours = Number(hours);

    if (isNaN(dailyHours) || dailyHours <= 0) {
      return res.status(400).json({
        error: "Hours must be a valid positive number.",
      });
    }

    const totalDays = getDaysUntilDeadline(deadline);

    console.log("Generating plan:");
    console.log("Goal:", goal);
    console.log("Hours per day:", dailyHours);
    console.log("Deadline:", deadline);
    console.log("Total days:", totalDays);

    const prompt = `
You are an expert AI study planner.

Create a REALISTIC, SPECIFIC and ACTIONABLE study plan for a college student.

USER INFORMATION:
Goal: ${goal}
Available study time per day: ${dailyHours} hours
Deadline: ${deadline}
Number of study days available: ${totalDays}

IMPORTANT RULES:

1. Create EXACTLY ${totalDays} days in the "days" array.
2. Every day must have specific study topics.
3. Do NOT give vague tasks such as:
   - "Study the topic"
   - "Revise concepts"
   - "Practice more"
   - "Learn important topics"

Instead, give concrete tasks.

For example:

BAD:
"Study Operating Systems"

GOOD:
"Study process states, PCB, process scheduling and context switching. Make short notes and solve 5 scheduling questions."

4. Respect the user's ${dailyHours} hours per day.
5. Break each day into realistic study sessions.
6. Include short breaks.
7. Include revision.
8. Include practice questions.
9. Include tests/mock tests near the end.
10. Increase difficulty gradually.
11. Include revision of previously studied topics.
12. Do not overload the student.
13. The final days should focus on revision, weak areas and mock tests.
14. Make the plan useful for an actual college student preparing for exams/interviews.
15. Each task should explain WHAT to study and WHAT to do.

VERY IMPORTANT:

Return ONLY valid JSON.

Do not use markdown.
Do not use backticks.
Do not write any explanation before or after the JSON.

Use exactly this structure:

{
  "title": "string",
  "dailyTime": number,
  "totalDays": number,
  "deadline": "string",
  "description": "string",
  "weeklyTarget": "string",
  "days": [
    {
      "day": number,
      "date": "string",
      "focus": "string",
      "totalHours": number,
      "tasks": [
        {
          "title": "string",
          "duration": number,
          "type": "Learn | Practice | Revision | Test",
          "description": "string"
        }
      ]
    }
  ]
}

ADDITIONAL REQUIREMENTS:

- "duration" must always be in MINUTES.
- Example: 30 means 30 minutes, 45 means 45 minutes, 60 means 1 hour.
- "date" must use YYYY-MM-DD format.
- "dailyTime" must equal ${dailyHours}.
- "totalDays" must equal ${totalDays}.
- "days" must contain exactly ${totalDays} objects.
- Each day's "totalHours" should be approximately ${dailyHours}.
- Task durations must add up approximately to the daily study time.
- Use dates beginning from today and ending on ${deadline}.
- Keep descriptions short but useful.
- For a technical subject such as DSA, include specific concepts and problems.
- For subjects such as Operating Systems, include specific concepts, examples and practice questions.
- Do not repeat exactly the same task on multiple days.
`;

    const response = await ai.models.generateContent({
      // model: "gemini-3.8-flash",
      model: "gemini-3.5-flash-lite",
      contents: prompt,

      config: {
        responseFormat: {
          text: {
            mimeType: "application/json",

            schema: {
              type: "object",

              properties: {
                title: {
                  type: "string",
                },

                dailyTime: {
                  type: "number",
                },

                totalDays: {
                  type: "integer",
                },

                deadline: {
                  type: "string",
                },

                description: {
                  type: "string",
                },

                weeklyTarget: {
                  type: "string",
                },

                days: {
                  type: "array",

                  items: {
                    type: "object",

                    properties: {
                      day: {
                        type: "integer",
                      },

                      date: {
                        type: "string",
                      },

                      focus: {
                        type: "string",
                      },

                      totalHours: {
                        type: "number",
                      },

                      tasks: {
                        type: "array",

                        items: {
                          type: "object",

                          properties: {
                            title: {
                              type: "string",
                            },

                            duration: {
                              type: "number",
                            },

                            type: {
                              type: "string",
                            },

                            description: {
                              type: "string",
                            },
                          },

                          required: [
                            "title",
                            "duration",
                            "type",
                            "description",
                          ],
                        },
                      },
                    },

                    required: [
                      "day",
                      "date",
                      "focus",
                      "totalHours",
                      "tasks",
                    ],
                  },
                },
              },

              required: [
                "title",
                "dailyTime",
                "totalDays",
                "deadline",
                "description",
                "weeklyTarget",
                "days",
              ],
            },
          },
        },
      },
    });

    // Gemini returns JSON as text
    let plan;

    try {
      plan = JSON.parse(response.text);
    } catch (parseError) {
      console.error("Could not parse Gemini JSON:");
      console.error(response.text);

      return res.status(500).json({
        error: "Gemini returned an invalid study plan format.",
      });
    }

    // Extra safety checks
    if (!plan.days || !Array.isArray(plan.days)) {
      return res.status(500).json({
        error: "AI did not return a daily schedule.",
      });
    }

    console.log(
      `Successfully generated ${plan.days.length} study days.`
    );

    res.json({
      plan,
    });

  } catch (error) {
    console.error("Gemini API Error:", error);

    res.status(500).json({
      error: "Failed to generate study plan.",
    });
  }
});

// app.listen(5000, () => {
//   console.log("AI server running on http://localhost:5000");
// });
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI server running on port ${PORT}`);
});