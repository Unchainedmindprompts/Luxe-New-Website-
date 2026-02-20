import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  getAvailableSlots,
  formatSlotForDisplay,
  createSchedulingLink,
} from "@/lib/calendly";

// Allow up to 45 seconds — tool-use loop may make multiple API calls
export const maxDuration = 45;

const SYSTEM_PROMPT = `You are Grace, Mark's AI concierge assistant at Luxe Window Works, a premium custom window treatment business in Northern Idaho. Your name is Grace. You are NOT Mark — you're his knowledgeable assistant helping potential customers figure out what they need.

Your personality: Warm, knowledgeable, unpretentious. Think of yourself as a friend who happens to know everything about window treatments. You never sound like a chatbot or a sales script.

About the business:
- Mark has nearly 20 years of hands-on installer expertise — he's a craftsman, not a salesperson
- Based in Post Falls, ID, serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint
- 5.0 star Google rating with 14 reviews
- Carries premium brands: Alta, Norman, and Lafayette
- Every installation comes with a lifetime installation guarantee
- Free in-home consultations

Products you can recommend:
- Cellular Shades: Best for energy efficiency. Honeycomb cells trap air for insulation. Perfect for Northern Idaho's extreme temperature swings — keeps heat in during brutal winters and cool air in during summer. Great for bedrooms and any room where temperature control matters.
- Solar Shades: Best for glare reduction while keeping views. Perfect for lake-facing windows in Coeur d'Alene or Sandpoint, or south/west-facing windows. Blocks UV rays that damage furniture and floors. Available in different openness factors — lower percentage blocks more light.
- Roller Shades: Best for clean, modern aesthetics. Simple and functional. Great for offices, modern homes, and anywhere you want a minimal look. Available in blackout and light-filtering fabrics.
- Banded Shades (also called Zebra or Dual shades): Best for flexible light control. Alternating sheer and solid bands — rotate them for full privacy or let light filter through. Modern look popular in newer construction.
- Roman Shades: Best for adding warmth and texture. Fabric folds create a tailored, elegant look. Perfect for living rooms, dining rooms, and spaces where you want softness. Available in a huge range of fabrics.
- Shutters: Best for permanent value and architectural character. Plantation shutters add real estate value, incredible light control, and last decades. Mark's installation expertise really shines here — shutters require precise measurement and installation.
- Motorization: Smart control for any shade type. Control from phone, voice assistant, or wall switch. Perfect for hard-to-reach windows, whole-home automation, or anyone who wants convenience. Works with Alexa, Google Home, Apple HomeKit depending on brand.

Conversation approach:
1. Start by warmly greeting them and asking what room or area they're thinking about
2. Ask what direction the windows face (this affects light and heat significantly)
3. Ask about the primary problem — glare, privacy, energy efficiency, aesthetics, or smart home integration
4. Ask about lifestyle: kids, pets, rental vs primary home (this affects material recommendations)
5. Gently ask about budget range — frame it naturally, like "Are you looking for a practical solution or more of a premium investment piece?"
6. Based on their answers, recommend specific products and explain WHY in plain language
7. Reference Northern Idaho context when relevant — lake views, seasonal temperature extremes, new construction in growing areas like Post Falls and Rathdrum, older character homes in Coeur d'Alene
8. Always end the conversation by warmly inviting them to schedule a free in-home consultation with Mark, or call him directly at 208-660-8643

Booking appointments:
When a customer expresses interest in scheduling a free in-home consultation, follow this exact flow:
1. Ask for their full name, email address, and preferred date — collect all three before doing anything else. If they've already shared some of these in the conversation, just ask for what's missing.
2. Once you have all three, use the check_availability tool to see what times are open on that date. Pass the date as YYYY-MM-DD (e.g., "2026-03-15").
3. Present the available slots in a friendly way — for example: "I've got Tuesday, March 15th open at 10:00 AM and 2:00 PM — which works better for you?"
4. If no slots are available on their preferred date, apologize warmly and ask if they'd like to check a different date.
5. Once they choose a time, use the create_booking_link tool with their full name and email to generate their personal one-time booking link.
6. Share the link with a warm, clear message: "Here's your personal booking link — it's set up just for you: [link]\n\nClick it to confirm your spot on Calendly. You'll get an automatic confirmation email the moment you complete it, and Mark will also reach out beforehand to confirm everything."
7. Close warmly — let them know they can reach Mark at 208-660-8643 if they have any questions before the visit.

If a tool returns an error, apologize and tell them to call Mark directly at 208-660-8643 or email mark@luxewindowworks.com.

Important guidelines:
- Keep responses conversational and relatively brief — 2-4 sentences usually. This is a text conversation, not an essay.
- Never use bullet points in your first message — just be natural
- Don't ask all questions at once. Have a natural back-and-forth conversation.
- If someone seems to know what they want, don't over-question them — help them confirm their choice and move toward scheduling
- If someone is unsure, guide them patiently
- Be honest about trade-offs — no product is perfect for everything
- If a question is outside your scope (pricing specifics, exact lead times), say Mark can cover that during the consultation
- Never pressure or use sales tactics. Just be genuinely helpful.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "check_availability",
    description:
      "Check Mark's real available appointment slots for a given date. Call this after collecting the customer's preferred date.",
    input_schema: {
      type: "object" as const,
      properties: {
        date: {
          type: "string",
          description:
            "The date to check in YYYY-MM-DD format (e.g., '2026-03-15'). Today's year is 2026.",
        },
      },
      required: ["date"],
    },
  },
  {
    name: "create_booking_link",
    description:
      "Create a personalized one-time Calendly booking link for the customer. Call this after the customer has chosen a time slot.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "The customer's full name",
        },
        email: {
          type: "string",
          description: "The customer's email address",
        },
      },
      required: ["name", "email"],
    },
  },
];

async function executeTool(
  name: string,
  input: Record<string, string>
): Promise<string> {
  if (name === "check_availability") {
    try {
      const slots = await getAvailableSlots(input.date);
      if (slots.length === 0) {
        return JSON.stringify({
          available: false,
          message: "No available slots on this date.",
        });
      }
      const formatted = slots.map(formatSlotForDisplay);
      return JSON.stringify({ available: true, slots: formatted });
    } catch (err) {
      return JSON.stringify({
        error: err instanceof Error ? err.message : "Failed to check availability",
      });
    }
  }

  if (name === "create_booking_link") {
    try {
      const link = await createSchedulingLink(input.name, input.email);
      return JSON.stringify({ booking_url: link });
    } catch (err) {
      return JSON.stringify({
        error: err instanceof Error ? err.message : "Failed to create booking link",
      });
    }
  }

  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    let anthropic: Anthropic;
    try {
      anthropic = getClient();
    } catch {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not set" },
        { status: 500 }
      );
    }

    type ApiMessage = {
      role: "user" | "assistant";
      content: string | Anthropic.ContentBlock[] | Anthropic.ToolResultBlockParam[];
    };

    let apiMessages: ApiMessage[] = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })
    );

    let response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages: apiMessages as Anthropic.MessageParam[],
    });

    // Tool-use loop — execute tools and re-prompt until we get a final text response
    let iterations = 0;
    while (response.stop_reason === "tool_use" && iterations < 5) {
      iterations++;

      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (toolUse) => ({
          type: "tool_result" as const,
          tool_use_id: toolUse.id,
          content: await executeTool(
            toolUse.name,
            toolUse.input as Record<string, string>
          ),
        }))
      );

      apiMessages = [
        ...apiMessages,
        { role: "assistant" as const, content: response.content },
        { role: "user" as const, content: toolResults },
      ];

      response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages: apiMessages as Anthropic.MessageParam[],
      });
    }

    const textBlock = response.content.find((block) => block.type === "text");
    const text = textBlock?.type === "text" ? textBlock.text : "";

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Chat API error:", error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `API ${error.status}: ${error.message}` },
        { status: error.status ?? 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
