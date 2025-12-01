import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
  private title = inject(Title);
  private meta = inject(Meta);
  private platformId = inject(PLATFORM_ID);

  currentDate = new Date();
  
  // 1. Hero Section Data (1 Main + 2 Sub)
  heroMain = {
    id: 1,
    title: "Global Markets Rally: S&P 500 Hits All-Time High",
    summary: "Wall Street celebrates as inflation data shows unexpected cooling.",
    image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=1470&auto=format&fit=crop",
    category: "Finance"
  };

  heroSub = [
    { id: 2, title: "Manhattan's New Skyline: The Supertall Era", image: "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=1470", category: "Real Estate" },
    { id: 3, title: "Tech Giants Face New EU Regulations", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1470", category: "Policy" }
  ];

  // 2. Vertical Ticker Data (أخبار طالعة لفوق)
  verticalNews = [
    { time: "10:30 AM", text: "Goldman Sachs upgrades AAPL target price." },
    { time: "10:15 AM", text: "Subway delays reported on Q line." },
    { time: "09:55 AM", text: "Mayor announces new park in Queens." },
    { time: "09:30 AM", text: "UN Council meets for emergency session." },
    { time: "09:00 AM", text: "Oil prices drop below $70/barrel." },
    { time: "08:45 AM", text: "Fashion Week schedule released." }
  ];

  // 3. Events Data (أحداث جانبية)
  upcomingEvents = [
    { day: "NOV 28", title: "NYC Tech Summit", location: "Javits Center" },
    { day: "DEC 01", title: "Winter Jazz Fest", location: "Blue Note" },
    { day: "DEC 05", title: "Startups Gala", location: "The Plaza" }
  ];

  // 4. Video Section
  videos = [
    { id: 101, title: "Inside the Stock Exchange", duration: "12:30", thumb: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1470" },
    { id: 102, title: "The Future of Broadway", duration: "08:45", thumb: "https://images.unsplash.com/photo-1502174832274-bc16605b0e58?q=80&w=1470" },
    { id: 103, title: "Hidden Gems of Brooklyn", duration: "15:20", thumb: "https://images.unsplash.com/photo-1517409962304-44b41b12b543?q=80&w=1470" }
  ];

  // 5. Opinion Section
  opinions = [
    { author: "Paul Krugman", title: "Why the Economy is stronger than you think", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
    { author: "Sarah Jessica", title: "The Return of Vintage Fashion in Soho", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
    { author: "Michael Bloomberg", title: "Climate Action cannot wait", avatar: "https://randomuser.me/api/portraits/men/85.jpg" }
  ];

  ngOnInit() {
    this.title.setTitle('NYC360 | The Ultimate News Portal');
    this.meta.addTags([{ name: 'description', content: 'Comprehensive coverage of NYC.' }]);
  }
}