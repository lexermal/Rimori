import { NextRequest, NextResponse } from "next/server";
import { parse } from 'url';

import { getTopics } from './researchTopic';

export async function GET(req: NextRequest) {
    const { query } = parse(req.url, true);
    const { file, topic } = query;

    const data = fakeResponses[file as string] as any;
    if (data) {
        return NextResponse.json(data);
    }
    return NextResponse.json(await getTopics(file!.toString(), topic!.toString()));
};

const fakeResponses = {
    "Value_dimensions_and_Business_failure": {
        "kid": [
            {
                "opposition_starting_text": "Why do apples not go in the trash? My mom says we shouldn't waste food!",
                "opposition_win_instructions": "Explain the concept of circular entrepreneurship using the example of 'Wasted Apples' in simple terms, emphasizing how it helps to use apples that would otherwise be wasted, making something new and yummy like cider."
            },
            {
                "opposition_starting_text": "What's a circular economy? Is it like a bike wheel?",
                "opposition_win_instructions": "Clarify the circular economy concept by comparing it to a toy or game that the child knows, which involves reusing parts or pieces, to illustrate the idea of keeping resources in use for as long as possible."
            }
        ],
        "oldy": [
            {
                "opposition_starting_text": "Businesses are just about making money. All this talk about 'circular economy' is just a fad, isn't it?",
                "opposition_win_instructions": "Convince the oldy by discussing the tangible benefits of circular entrepreneurship, such as cost savings from reduced waste, and the success of 'Wasted Apples' as a real-world example that aligns profit with environmental stewardship."
            },
            {
                "opposition_starting_text": "I've run a business before, and failure is just a sign of incompetence. Why should we learn from failure?",
                "opposition_win_instructions": "Challenge the oldy's fixed mindset by presenting the findings from the study on entrepreneurs' attitudes towards failure, emphasizing how prior start-up experience and business closure can lead to a more positive attitude and future success."
            }
        ],
        "visionary": [
            {
                "opposition_starting_text": "Circular entrepreneurship sounds promising, but how could it transform industries beyond food and beverages?",
                "opposition_win_instructions": "Inspire the visionary by suggesting how circular principles can be applied to the fashion industry, where recycling and upcycling clothes can reduce waste and create new, sustainable fashion lines."
            },
            {
                "opposition_starting_text": "Learning from failure is important, but can this concept be applied to educational settings to prepare future entrepreneurs?",
                "opposition_win_instructions": "Convince the visionary by proposing experiential learning programs in schools that simulate business challenges and failures, allowing students to develop resilience and a positive attitude towards setbacks."
            }
        ]
    },
    "Team_dynamics": {
        "kid": [
            {
                "opposition_starting_text": "Why do teams have to have steps like 'forming' and 'storming'? Can't they just do stuff?",
                "opposition_win_instructions": "Explain the stages of team development in simple terms, using an analogy of a group of friends playing a game together, emphasizing how they learn to get along and work as a team."
            },
            {
                "opposition_starting_text": "What's a 'shared mindset'? Do you mean like when me and my friends all think ice cream is the best?",
                "opposition_win_instructions": "Clarify the concept of a shared mindset by comparing it to how friends might agree on their favorite game or food, and how that helps them play or enjoy eating out together."
            },
            {
                "opposition_starting_text": "Why do teams need to learn from the smartest person? I thought everyone's ideas are important!",
                "opposition_win_instructions": "Use an example of a classroom where everyone listens to the kid who's really good at a subject so they can all learn, but also share their own ideas to make a project better."
            }
        ],
        "oldy": [
            {
                "opposition_starting_text": "In my days, we didn't need all these fancy stages like 'norming' and 'performing'. Why can't teams just get the job done?",
                "opposition_win_instructions": "Discuss the importance of team development stages by relating them to a well-known historical event or team, showing how these stages lead to better outcomes."
            },
            {
                "opposition_starting_text": "This 'shared mindset' business sounds like groupthink to me. How is that supposed to be good for a team?",
                "opposition_win_instructions": "Differentiate between a shared mindset and groupthink by providing historical examples where a shared vision led to success without stifling individual creativity."
            },
            {
                "opposition_starting_text": "All this talk about 'learning from failures' in teams is nonsense. Shouldn't we just focus on not failing in the first place?",
                "opposition_win_instructions": "Explain the concept of learning from small failures by referencing a well-known figure or company that succeeded because they learned from their mistakes."
            }
        ],
        "visionary": [
            {
                "opposition_starting_text": "How can the stages of team development be applied to virtual teams in a global company?",
                "opposition_win_instructions": "Describe how the stages of team development are relevant to virtual teams, using a specific example of a global project and how these stages can improve collaboration across different time zones and cultures."
            },
            {
                "opposition_starting_text": "In what ways can a shared mindset benefit a startup trying to innovate in a crowded market?",
                "opposition_win_instructions": "Illustrate the benefits of a shared mindset for a startup by discussing how it can foster a strong company culture and drive innovation, using a real or hypothetical startup as an example."
            },
            {
                "opposition_starting_text": "Could the principles of team dynamics be applied to improve the efficiency of machine learning algorithms working in ensemble?",
                "opposition_win_instructions": "Explain how the principles of team dynamics could enhance machine learning ensemble methods by ensuring diverse, yet coordinated, algorithms that share information and learn from each other to improve overall performance."
            }
        ]
    },
    "Opportunity_recognition": {
        "kid": [
            {
                "opposition_starting_text": "Hey, why do people start their own businesses instead of just working for someone else?",
                "opposition_win_instructions": "Explain the concept of entrepreneurial opportunity recognition in simple terms, using an analogy of finding a hidden treasure or creating a lemonade stand to illustrate the excitement and potential rewards of discovering and pursuing a new business idea."
            },
            {
                "opposition_starting_text": "But how do you know if your business idea is really good or just something silly?",
                "opposition_win_instructions": "Discuss the three characteristics of an opportunity—potential economic value, newness, and perceived desirability—using examples like a new toy that everyone wants to play with because it's fun, unique, and everyone agrees it's cool."
            },
            {
                "opposition_starting_text": "What if you think of something but you're not sure what to do next?",
                "opposition_win_instructions": "Describe the process of opportunity recognition as a journey of exploration, where you start with a fun idea and then play detective to learn more about it, ask friends and family for advice, and slowly make your idea better and better."
            }
        ],
        "oldy": [
            {
                "opposition_starting_text": "I've seen businesses come and go. What's so special about recognizing opportunities now?",
                "opposition_win_instructions": "Highlight the dynamic nature of the modern market, emphasizing technological and societal changes that create new niches, and explain how continuous learning and adaptability are essential, even with past experience."
            },
            {
                "opposition_starting_text": "In my days, we stuck to what we knew. Why should anyone bother looking for something new?",
                "opposition_win_instructions": "Explain the concept of opportunity recognition through the lens of changing conditions, such as technological advancements and market shifts, and how these can lead to profitable ventures that weren't possible before, using historical examples for relatability."
            },
            {
                "opposition_starting_text": "I don't believe in this 'newfangled' way of doing business. What's wrong with the old ways?",
                "opposition_win_instructions": "Discuss the limitations of a fixed mindset and the benefits of an exploratory learning mindset, using examples of successful businesses that have adapted to change and innovation to stay relevant and profitable."
            }
        ],
        "visionary": [
            {
                "opposition_starting_text": "How can the principles of opportunity recognition be applied to revitalize a declining industry?",
                "opposition_win_instructions": "Discuss the application of pattern recognition and the integration of new technologies or market approaches to identify untapped potential within a declining industry, using a concrete example like the transformation of the print media industry with digital platforms."
            },
            {
                "opposition_starting_text": "What if we take the concept of opportunity recognition to a non-profit setting?",
                "opposition_win_instructions": "Explain how non-profits can benefit from entrepreneurial thinking by recognizing opportunities to serve unmet needs, create social value, and ensure sustainability, using an example like a non-profit that innovates in clean water solutions for underserved communities."
            },
            {
                "opposition_starting_text": "Can opportunity recognition be the key to solving environmental challenges?",
                "opposition_win_instructions": "Illustrate how opportunity recognition can lead to environmental innovation by connecting technological advancements with sustainable practices, using an example like the development of renewable energy solutions that address both economic and ecological concerns."
            }
        ]
    },
    "Entrepreneurial_process_and_Perspectives": {
        "kid": [
            {
                "opposition_starting_text": "Hey, what's an entrepreneur? Is it like a superhero who makes cool stuff?",
                "opposition_win_instructions": "Explain the concept of entrepreneurship in simple terms, using relatable examples or stories that engage the child's imagination, avoiding technical jargon."
            },
            {
                "opposition_starting_text": "But why do people start their own business? Don't they like having a boss?",
                "opposition_win_instructions": "Discuss the motivations behind entrepreneurship, such as the desire for independence and creativity, in a way that resonates with the child's experiences, like playing games or building their own projects."
            },
            {
                "opposition_starting_text": "What's a market? Is it like when I trade my snacks with friends?",
                "opposition_win_instructions": "Use the analogy of trading snacks to explain the concept of a market and the role of entrepreneurs in creating and exchanging value."
            }
        ],
        "oldy": [
            {
                "opposition_starting_text": "I've seen businesses come and go. What's so special about entrepreneurship now?",
                "opposition_win_instructions": "Highlight the evolving nature of entrepreneurship and its current relevance, using historical examples and recent trends to challenge the fixed mindset."
            },
            {
                "opposition_starting_text": "In my days, we stuck to one job. Why do these young folks keep chasing new opportunities?",
                "opposition_win_instructions": "Explain the concept of entrepreneurial opportunities and how they contribute to innovation and societal progress, appealing to the oldy's sense of historical development."
            },
            {
                "opposition_starting_text": "All this talk about entrepreneurship, but it's just another way to make money, isn't it?",
                "opposition_win_instructions": "Discuss the broader impact of entrepreneurship on society, such as job creation and solving problems, to demonstrate its value beyond financial gain."
            }
        ],
        "visionary": [
            {
                "opposition_starting_text": "How can the entrepreneurial process be applied to revitalize a declining industry?",
                "opposition_win_instructions": "Provide concrete examples of how entrepreneurial innovation can introduce new products or services, improve efficiency, or create new markets within a declining industry."
            },
            {
                "opposition_starting_text": "What role does entrepreneurship play in shaping the future of education?",
                "opposition_win_instructions": "Discuss the potential for entrepreneurship to disrupt traditional education through technological innovation, personalized learning experiences, and new business models."
            },
            {
                "opposition_starting_text": "Can the principles of entrepreneurship be used to address environmental challenges?",
                "opposition_win_instructions": "Explain how entrepreneurial approaches can lead to sustainable business practices, green technologies, and innovative solutions to environmental issues."
            }
        ]
    },
    "Decision-Making_and_Entrepreneurial_Learning": {
        "kid": [
            {
                "opposition_starting_text": "Why do you have to make decisions when you start a business? Can't you just sell stuff?",
                "opposition_win_instructions": "Explain the concept of entrepreneurial decision-making in simple terms, emphasizing the importance of making good choices to have a successful lemonade stand, for example."
            },
            {
                "opposition_starting_text": "What's effectuation? Is it like a magic spell to make money?",
                "opposition_win_instructions": "Clarify the concept of effectuation by comparing it to building something with Legos, using what you have to create something cool."
            },
            {
                "opposition_starting_text": "What does it mean to learn in business? Don't you just need to know how to count money?",
                "opposition_win_instructions": "Simplify the idea of entrepreneurial learning by likening it to learning how to play a new game, where you get better the more you play and learn from mistakes."
            }
        ],
        "oldy": [
            {
                "opposition_starting_text": "I've run a business for 40 years, and I tell you, it's all about having the right plan. This 'effectuation' is just nonsense.",
                "opposition_win_instructions": "Introduce the principles of effectuation and how they differ from traditional planning, using real-world examples to demonstrate their effectiveness in today's rapidly changing business environment."
            },
            {
                "opposition_starting_text": "In my day, we learned from hard work, not from failing. This idea that failure is good for business is just an excuse for incompetence.",
                "opposition_win_instructions": "Discuss the concept of 'cycling' and how it contributes to entrepreneurial learning, using examples of successful entrepreneurs who learned from their failures."
            },
            {
                "opposition_starting_text": "All this talk about learning at different levels is overcomplicated. You hire smart people, and that's that.",
                "opposition_win_instructions": "Explain the importance of individual, team, and organizational learning in entrepreneurship, and how it leads to innovation and growth beyond just hiring smart individuals."
            }
        ],
        "visionary": [
            {
                "opposition_starting_text": "How can the principles of effectuation be applied to the field of renewable energy, where uncertainty is a constant factor?",
                "opposition_win_instructions": "Describe how the principles of effectuation, such as leveraging contingencies and forming strategic partnerships, can be particularly effective in the renewable energy sector."
            },
            {
                "opposition_starting_text": "In what ways can entrepreneurial learning transform the education technology industry?",
                "opposition_win_instructions": "Discuss how entrepreneurial learning at the individual and organizational levels can drive innovation in education technology, leading to adaptive learning platforms and personalized education solutions."
            },
            {
                "opposition_starting_text": "Could the concept of 'cycling' be beneficial in the context of urban development and smart cities?",
                "opposition_win_instructions": "Explain how the iterative process of 'cycling' can be applied to urban development, allowing for flexible adaptation to new technologies and resident needs in smart city planning."
            }
        ]
    }
} as any;