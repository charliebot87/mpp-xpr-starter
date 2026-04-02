import { mppx } from '@/lib/mpp'

const jokes = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "A SQL query walks into a bar, sees two tables, and asks... 'Can I JOIN you?'",
  "Why do Java developers wear glasses? Because they can't C#.",
  "There are only 10 types of people in the world: those who understand binary and those who don't.",
  "A programmer's wife tells him: 'Go to the store and buy a loaf of bread. If they have eggs, buy a dozen.' He comes home with 12 loaves of bread.",
  "Why did the developer go broke? Because he used up all his cache.",
  "!false — it's funny because it's true.",
  "How many programmers does it take to change a light bulb? None. That's a hardware problem.",
  "Why do programmers hate nature? It has too many bugs and no documentation.",
  "What's a programmer's favorite hangout place? Foo Bar.",
  "Why did the blockchain developer break up with the database? Too many commitment issues.",
  "I told my AI to write me a joke. It said 'you are the joke.' I'm keeping it.",
]

export async function GET(request: Request) {
  const result = await mppx.charge({
    amount: '1.0000 XPR',
  })(request)

  if (result.status === 402) return result.challenge

  const joke = jokes[Math.floor(Math.random() * jokes.length)]

  return result.withReceipt(
    Response.json({ joke, paid: true })
  )
}
