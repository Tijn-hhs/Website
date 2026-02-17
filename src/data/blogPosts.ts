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
    author: 'Leavs Team',
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
    author: 'Leavs Team',
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
  {
    id: 'restaurant-culture-italy',
    title: 'Italian Restaurant Culture: How to Dine Like a Local',
    date: '2026-02-16',
    author: 'Leavs Team',
    excerpt: 'From table service and cover charges to the multi-course flow of a traditional meal, learn the unspoken rules of dining out in Italy and enjoy restaurants with confidence.',
    imageUrl: '/assets/Blog_3.jpg',
    content: `
      <p>Eating out in Italy is a ritual, not a rush. Whether you are grabbing a casual pizza or celebrating with a long multi-course meal, understanding restaurant culture will help you feel at home and avoid common misunderstandings.</p>
      <br />
      <h2>Table Service and the Role of the Waiter</h2>
      <p>In most Italian restaurants, you will be seated by staff and served at your table. There is no counter ordering. Waiters are not expected to check on you constantly, so do not interpret a slower pace as bad service. If you need them, make eye contact or give a small wave and say "scusi" to get attention.</p>
      <br />
      <h2>Coperto and Pane</h2>
      <p>Many restaurants charge a small <strong>coperto</strong> (cover charge), usually €1-€3, which includes bread and table setting. This is normal and not a tip. It will appear on the bill, so do not be surprised.</p>
      <br />
      <h2>The Structure of a Meal</h2>
      <p>Traditional Italian dining follows a clear sequence. You can order as much or as little as you want, but knowing the flow helps:</p>
      <br />
      <p><strong>Antipasto:</strong> Starters like cured meats, cheeses, or vegetables.</p>
      <br />
      <p><strong>Primo:</strong> Pasta, risotto, or soup.</p>
      <br />
      <p><strong>Secondo:</strong> Meat or fish, often with sides.</p>
      <br />
      <p><strong>Contorno:</strong> Side dishes like salad or grilled vegetables, ordered separately.</p>
      <br />
      <p><strong>Dolce:</strong> Dessert, plus coffee or digestivi to finish.</p>
      <br />
      <h2>Sharing and Customizing</h2>
      <p>Sharing plates is common for antipasti and sometimes pizzas. Pasta is usually ordered as a full portion per person. Heavy customization (like swapping sauces) is less common than in some countries, but simple requests are fine. If you have dietary needs, mention them early and politely.</p>
      <br />
      <h2>Water and Bread Etiquette</h2>
      <p>When seated, you will usually be asked if you want sparkling or still water. Bottled water is standard and not free. Bread is often placed on the table; it is included in the coperto.</p>
      <br />
      <h2>Pace, Reservations, and Timing</h2>
      <p>Dinner starts later than in many countries. Restaurants often open around 7:30 PM or 8 PM, and locals linger. It is normal to spend 1.5-2 hours at the table. Reservations are common, especially on weekends or for popular places. Call ahead or use online booking when available.</p>
      <br />
      <h2>Paying the Bill</h2>
      <p>Ask for the check by saying "il conto, per favore." The bill is usually brought to the table, and you can pay there or at the register. Splitting is possible, but keep it simple by dividing evenly if you can. Tipping is not required; leaving a few euros for excellent service is appreciated but optional.</p>
      <br />
      <h2>Student-Friendly Tips</h2>
      <p>Look for <strong>trattorie</strong> and <strong>osterie</strong> for authentic, affordable meals. Fixed-price menus at lunchtime are great value. Pizzerie are usually budget-friendly and perfect for groups. If you want to try a restaurant on a tighter budget, choose just a primo and water.</p>
      <br />
      <h2>Final Thoughts</h2>
      <p>Italian restaurant culture is built on patience, conversation, and enjoying food without rushing. Once you embrace the rhythm, dining out becomes one of the best parts of living in Italy.</p>
    `,
    metadata: 'Italian Culture, Restaurants, Dining Etiquette, Food and Drink, Student Life',
  },
  {
    id: 'essential-italian-words',
    title: 'The Most Important Italian Words: A Survival Guide for Students',
    date: '2026-02-16',
    author: 'Leavs Team',
    excerpt: 'From greetings and politeness to transport and daily life, these essential Italian words and phrases will help you navigate Italy with confidence.',
    imageUrl: '/assets/Blog_4.jpg',
    content: `
      <p>Learning Italian takes time, but a small set of high-impact words can make daily life much easier. Here is a practical list of essentials every student in Italy should know.</p>
      <br />
      <h2>Greetings and Polite Basics</h2>
      <p><strong>Ciao:</strong> Hi/bye (informal).</p>
      <br />
      <p><strong>Buongiorno:</strong> Good morning/hello (formal).</p>
      <br />
      <p><strong>Buonasera:</strong> Good evening.</p>
      <br />
      <p><strong>Per favore:</strong> Please.</p>
      <br />
      <p><strong>Grazie:</strong> Thank you.</p>
      <br />
      <p><strong>Prego:</strong> You are welcome / please (as in “after you”).</p>
      <br />
      <p><strong>Scusi:</strong> Excuse me (formal).</p>
      <br />
      <p><strong>Mi dispiace:</strong> I am sorry.</p>
      <br />
      <h2>Getting Help</h2>
      <p><strong>Parla inglese?</strong> Do you speak English?</p>
      <br />
      <p><strong>Non capisco:</strong> I do not understand.</p>
      <br />
      <p><strong>Puoi ripetere?</strong> Can you repeat?</p>
      <br />
      <p><strong>Un momento, per favore:</strong> One moment, please.</p>
      <br />
      <h2>Eating Out</h2>
      <p><strong>Un tavolo per due, per favore:</strong> A table for two, please.</p>
      <br />
      <p><strong>Il menu, per favore:</strong> The menu, please.</p>
      <br />
      <p><strong>Il conto, per favore:</strong> The check, please.</p>
      <br />
      <p><strong>Senza:</strong> Without (useful for allergies).</p>
      <br />
      <p><strong>Acqua frizzante / naturale:</strong> Sparkling / still water.</p>
      <br />
      <h2>Shopping and Daily Life</h2>
      <p><strong>Quanto costa?</strong> How much does it cost?</p>
      <br />
      <p><strong>Posso pagare con carta?</strong> Can I pay by card?</p>
      <br />
      <p><strong>Aperto / chiuso:</strong> Open / closed.</p>
      <br />
      <p><strong>Bagno:</strong> Bathroom.</p>
      <br />
      <h2>Transport</h2>
      <p><strong>Biglietto:</strong> Ticket.</p>
      <br />
      <p><strong>Stazione:</strong> Station.</p>
      <br />
      <p><strong>Fermata:</strong> Stop (bus/tram).</p>
      <br />
      <p><strong>Binario:</strong> Platform.</p>
      <br />
      <h2>Student Life</h2>
      <p><strong>Universita:</strong> University.</p>
      <br />
      <p><strong>Lezione:</strong> Class/lecture.</p>
      <br />
      <p><strong>Esame:</strong> Exam.</p>
      <br />
      <p><strong>Appunti:</strong> Notes.</p>
      <br />
      <h2>Quick Tips</h2>
      <p>Italians appreciate effort. Even a simple "buongiorno" can change the tone of an interaction. If you forget a word, smile and try anyway—most people will meet you halfway.</p>
      <br />
      <h2>Final Thoughts</h2>
      <p>Master these essentials first, then build from there. A little Italian goes a long way, especially in smaller cities. Start with this list, practice daily, and you will feel more confident in no time.</p>
    `,
    metadata: 'Italian Language, Survival Italian, Student Life, Daily Life in Italy, Tips',
  },
]
