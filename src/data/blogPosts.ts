export type BlogPost = {
  id: string
  title: string
  date: string
  author: string
  excerpt: string
  content: string
  metadata: string
  imageUrl?: string
}

export const blogPosts: BlogPost[] = [
  {
    id: 'italian-coffee-culture',
    title: 'The Art of Italian Coffee: A Student\'s Guide to Caffè Culture',
    date: '2026-02-16',
    author: 'LiveCity Team',
    excerpt: 'Moving to Italy as an international student? Welcome to the country where coffee isn\'t just a drink—it\'s a way of life. Learn the essentials of Italian coffee culture.',
    imageUrl: '/assets/Blog_1.jpg',
    content: `
      <p>Moving to Italy as an international student? Welcome to the country where coffee isn't just a drink—it's a way of life. Understanding Italian coffee culture is essential to fitting in and fully experiencing la dolce vita.</p>
      <br />
      <h2>The Basics: What You Need to Know</h2>
      <p>In Italy, coffee typically means one thing: espresso. That small, intense shot is the foundation of Italian coffee culture. Italians don't do large, milky coffees throughout the day—that's reserved for breakfast only.</p>
      <br />
      <h2>Types of Italian Coffee</h2>
      <p><strong>Espresso (or Caffè):</strong> Simply ask for "un caffè" and you'll get a single shot of espresso. This is the most common order and can be enjoyed any time of day.</p>
      <br />
      <p><strong>Cappuccino:</strong> The famous blend of espresso, steamed milk, and foam. But here's the catch—locals only drink this before 11 AM! Ordering a cappuccino after lunch will immediately mark you as a tourist.</p>
      <br />
      <p><strong>Caffè Macchiato:</strong> An espresso "marked" with a small amount of foamed milk. Perfect for those who find straight espresso too intense but still want to follow Italian customs.</p>
      <br />
      <p><strong>Caffè Lungo:</strong> A "long" coffee made by letting more water pass through the espresso grounds. Still not as much as an American coffee, but less concentrated than regular espresso.</p>
      <br />
      <p><strong>Caffè Americano:</strong> Espresso with hot water added. Available in most places, though locals might raise an eyebrow.</p>
      <br />
      <h2>Coffee Bar Etiquette</h2>
      <p>The typical Italian coffee experience happens at the bar (counter), not sitting at a table. Here's how it works:</p>
      <br />
      <p>1. <strong>Pay first:</strong> Go to the cashier (cassa), order and pay, then take your receipt to the bar.<br />
      2. <strong>Stand at the bar:</strong> Italians typically enjoy their coffee standing. Sitting at a table costs significantly more—sometimes double or triple the price.<br />
      3. <strong>Drink it quickly:</strong> Espresso is meant to be consumed in a few sips, not sipped slowly. Most locals finish within 2-3 minutes.<br />
      4. <strong>Morning pastries:</strong> If you order a cappuccino, pair it with a cornetto (Italian croissant). It's the perfect breakfast combo.</p>
      <br />
      <h2>Price Point</h2>
      <p>One of the best parts about Italian coffee culture? The price! A standard espresso at the bar typically costs between €1-€1.50 in most cities. Even a cappuccino rarely exceeds €2 when standing at the bar. This makes daily coffee runs totally affordable on a student budget.</p>
      <br />
      <h2>Regional Differences</h2>
      <p>While coffee culture is national, you'll notice regional variations. In Naples, caffè is particularly strong and served in uniquely small cups. In Trieste, near the Austrian border, you might find more variation and larger portions. Milan's coffee scene is slightly more international, while Rome maintains traditional customs.</p>
      <br />
      <h2>Student Tip: Coffee Breaks Between Classes</h2>
      <p>Use coffee breaks strategically! A quick espresso between lectures is perfect for recharging. Many students meet at the local bar near campus—it's where friendships are formed and study groups are organized. The 10-minute coffee break is an integral part of Italian university life.</p>
      <br />
      <h2>Final Thoughts</h2>
      <p>Embracing Italian coffee culture is about more than just the drink—it's about the ritual, the social aspect, and the brief moment of pleasure in a busy day. Don't be afraid to try different places and find your favorite local bar. Before long, the barista will know your order by heart, and you'll feel like a true local.</p>
      <br />
      <p>Buon caffè!</p>
    `,
    metadata: 'Italian Culture, Coffee Culture, Student Life, Daily Life in Italy',
  },
  {
    id: 'aperitivo-culture-italy',
    title: 'Aperitivo Culture: Italy\'s Best Social Tradition for Students',
    date: '2026-02-14',
    author: 'LiveCity Team',
    excerpt: 'Discover the Italian aperitivo tradition—the perfect blend of socializing, snacking, and unwinding. Learn how to navigate this beloved pre-dinner ritual on a student budget.',
    imageUrl: '/assets/Blog_2.jpg',
    content: `
      <p>If there's one Italian tradition that international students fall in love with immediately, it's aperitivo. This delightful pre-dinner ritual combines drinks, food, and socializing in a way that's uniquely Italian. Let's dive into everything you need to know about aperitivo culture.</p>
      <br />
      <h2>What Is Aperitivo?</h2>
      <p>Aperitivo is the Italian happy hour tradition, typically taking place between 6 PM and 9 PM. But it's much more than just discounted drinks—it's a social institution. The word comes from "aprire" (to open), referring to opening your appetite before dinner. You'll order a drink and receive complimentary snacks, ranging from simple chips and olives to elaborate buffets.</p>
      <br />
      <h2>The Perfect Time and Place</h2>
      <p>Aperitivo time is sacred in Italy, usually starting around 6:30 or 7 PM. In student-friendly cities like Milan, Turin, and Bologna, you'll find bustling aperitivo scenes near university areas. Look for bars with outdoor seating that start getting crowded as the sun sets—that's your sign of a good aperitivo spot.</p>
      <br />
      <h2>Classic Aperitivo Drinks</h2>
      <p><strong>Spritz:</strong> The iconic orange cocktail made with Aperol, Prosecco, and soda water. It's the most popular aperitivo drink and costs around €5-€8.</p>
      <br />
      <p><strong>Negroni:</strong> A stronger option made with gin, vermouth, and Campari. Perfect if you prefer something less sweet.</p>
      <br />
      <p><strong>Hugo:</strong> A refreshing mix of Prosecco, elderflower syrup, mint, and soda. Lighter and sweeter than Spritz.</p>
      <br />
      <p><strong>Americano:</strong> Campari, sweet vermouth, and soda water. The predecessor to the Negroni.</p>
      <br />
      <p><strong>Non-Alcoholic Options:</strong> Don't drink? No problem! Order a Crodino, Sanbitter, or even just juice. The inclusive atmosphere means everyone is welcome.</p>
      <br />
      <h2>The Food: From Chips to Buffets</h2>
      <p>What you get with your drink varies dramatically by location and price. At basic bars, expect chips, olives, and peanuts. At mid-range spots, you'll find focaccia, cheese, cold cuts, and vegetable trays. Premium aperitivo venues offer extensive buffets with pasta salads, pizzette, arancini, and more—sometimes enough to replace dinner entirely!</p>
      <br />
      <h2>Aperitivo Etiquette</h2>
      <p>1. <strong>One drink minimum:</strong> To access the food, you need to order at least one drink. Some places require re-ordering if you want more food.<br />
      2. <strong>Don't overfill your plate:</strong> Take reasonable portions. You can go back, but piling food high is considered poor form.<br />
      3. <strong>It's not dinner:</strong> While students often make it dinner, aperitivo is traditionally a light snack before the evening meal.<br />
      4. <strong>Pace yourself:</strong> Aperitivo is about socializing, not getting drunk quickly. Italians take their time.</p>
      <br />
      <h2>Student Budget Tips</h2>
      <p>Aperitivo can be incredibly budget-friendly if you know where to go. University districts often have student-priced aperitivo deals (€5-€7 for a drink plus buffet). Go with friends and make it your dinner—one drink with generous buffet food can be cheaper than cooking. Tuesday through Thursday often have better deals than weekends.</p>
      <br />
      <p>Some bars offer "apericena" (aperitivo + cena/dinner), where €10-€15 gets you unlimited buffet access with your drink. Perfect for hungry students!</p>
      <br />
      <h2>Regional Variations</h2>
      <p><strong>Milan:</strong> The aperitivo capital! The Navigli district is famous for its evening scene. Expect higher prices but generous buffets.</p>
      <br />
      <p><strong>Turin:</strong> Where aperitivo was born. Traditional and elegant, with excellent vermouth-based drinks.</p>
      <br />
      <p><strong>Rome:</strong> More relaxed and less buffet-heavy than northern cities. Focus is on the drink and social atmosphere.</p>
      <br />
      <p><strong>Bologna:</strong> Student-friendly pricing with hearty food options. Great university-area bars.</p>
      <br />
      <h2>Making Friends Over Aperitivo</h2>
      <p>Aperitivo is where social connections happen. It's less formal than dinner but more social than lunch. Join student groups for aperitivo meetups, or invite classmates you'd like to know better. The relaxed atmosphere and shared table arrangements naturally encourage conversation.</p>
      <br />
      <p>Many Italian students use aperitivo as their main social time—it's where you'll hear about weekend plans, upcoming events, and get insider tips about university life.</p>
      <br />
      <h2>Final Thoughts</h2>
      <p>Aperitivo perfectly captures Italian values: taking time to enjoy life, connecting with friends, and savoring good food and drinks. As a student in Italy, embracing aperitivo culture means you're not just living in Italy—you're living like an Italian.</p>
      <br />
      <p>So grab some friends, find a cozy bar, order a Spritz, and immerse yourself in this wonderful tradition. Salute!</p>
    `,
    metadata: 'Italian Culture, Aperitivo, Social Life, Student Life, Food and Drink',
  },
]
