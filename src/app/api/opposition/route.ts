// demo implementation based on story generation

import { convertToCoreMessages, streamText } from 'ai';
import { z } from 'zod';
import { createAnthropic } from '@ai-sdk/anthropic';
import { NEXT_PUBLIC_ANTHROPIC_API_KEY } from '@/utils/constants';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const anthropic = createAnthropic({ apiKey: NEXT_PUBLIC_ANTHROPIC_API_KEY });

  const result = await streamText({
    model: anthropic("claude-3-5-sonnet-20240620"),
    messages: convertToCoreMessages(messages),
    tools: toolBuilder.getTools(),
  });

  return result.toDataStreamResponse();
}

type BasicType = string | number | boolean;

class ToolBuilder {

  tools = {} as any;

  public addClientTool(name: string, description = "") {
    let parameters = z.object({});

    const builder = {
      addParameter: (name: string, type: BasicType, description: string) => {
        parameters = parameters.extend({
          [name]: this.buildParameter(type, description)
        });
        return builder;
      },
      build: () => {
        this.tools[name] = {
          description,
          parameters
        }
      }
    }
    return builder;
  }

  public addUserInteractionTool(name: string, description = "") {
    return this.addClientTool(name, description);
  }

  public addServerTool(name: string, description = "") {
    let parameters = z.object({});

    const builder = {
      addParameter: (name: string, type: BasicType, description: string) => {
        parameters = parameters.extend({
          [name]: this.buildParameter(type, description)
        });
        return builder;
      },
      build: <T, W>(fn: (params: T) => Promise<W>) => {
        this.tools[name] = {
          description,
          parameters,
          execute: fn,
        }
      }
    }
    return builder;
  }

  private buildParameter(type: BasicType, description: string) {
    if (typeof type === 'string') {
      return z.string().describe(description);
    } else if (typeof type === 'number') {
      return z.number().describe(description);
    } else if (typeof type === 'boolean') {
      return z.boolean().describe(description);
    }
    return z.object({}).describe(description);
  }

  getTools() {
    return this.tools;
  }

}

const toolBuilder = new ToolBuilder();

// toolBuilder.addClientTool('getLocation', 'Get the user location. Always ask for confirmation before using this tool.')
//   .addParameter('city', 'string', 'The city to get the weather information for.')
//   .build();

// toolBuilder.addUserInteractionTool('askForConfirmation', 'Ask the user for confirmation.')
//   .addParameter('message', 'string', 'The message to ask for confirmation.')
//   .build();

// toolBuilder.addServerTool('getWeatherInformation', 'Show the weather in a given city to the user.')
//   .addParameter('city', 'string', 'The city to get the weather information for.')
//   .build<{ city: string }, string>(async ({ city }) => {
//     console.log('server action getWeatherInformation', city);
//     const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
//     return weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
//   });

toolBuilder.addUserInteractionTool("askForChapterDecision", "Ask the user how the story should continue. The response is a string with the users choice and correctness of their answer.")
  .addParameter("question", "string", "Ask with an open ended question how the story should continue")
  .addParameter("possibility1", "string", "The first possibility how the story could continue")
  .addParameter("possibility2", "string", "The second possibility how the story could continue")
  .addParameter("possibility3", "string", "The third possibility how the story could continue")
  .build();

toolBuilder.addClientTool("storyEnded", "End the story. The user has reached the end of the story.")
  .build();

toolBuilder.getTools();

