import { ParsedSearchIntent, SearchFilters } from '@/types';
import { getTodayDateString, getTomorrowDateString } from '@/lib/utils';
import { INITIAL_CATEGORIES, DEHRADUN_NEIGHBORHOODS } from '@/lib/seed/data';

export class SearchIntentParser {
  /**
   * Parses natural language search strings into structured filter parameters.
   */
  static parse(query: string): ParsedSearchIntent {
    const rawQuery = (query || '').trim().toLowerCase();
    const intent: ParsedSearchIntent = {
      rawQuery: query,
      confidence: 0,
    };

    if (!rawQuery) {
      return intent;
    }

    let matchScore = 0;

    // 1. Detect Category / Keywords
    const categoryKeywords: Record<string, string[]> = {
      'health-wellness': ['dentist', 'dental', 'teeth', 'tooth', 'physio', 'physiotherapy', 'clinic', 'doctor', 'blood test', 'diagnostic', 'xray', 'x-ray'],
      'beauty-grooming': ['haircut', 'barber', 'salon', 'fade', 'beard', 'facial', 'spa', 'massage', 'nails', 'waxing', 'kerastase', 'makeup'],
      'fitness-sports': ['pickleball', 'badminton', 'gym', 'workout', 'turf', 'yoga', 'court', 'fitness', 'swimming', 'trainer'],
      'plumbing-sanitary': ['plumber', 'plumbing', 'pipe', 'leak', 'tap', 'drain', 'water tank', 'sanitary', 'faucet', 'flush', 'water motor'],
      'furniture-carpentry': ['furniture', 'carpenter', 'carpentry', 'wood', 'sofa repair', 'sofa', 'reupholstery', 'table repair', 'chair repair', 'bed repair', 'wardrobe', 'door lock'],
      'tailoring-boutique': ['tailor', 'tailoring', 'stitching', 'alteration', 'blouse', 'suit', 'kurta', 'dressmaker', 'pant fitting', 'hemming', 'boutique'],
      'appliance-repair': ['washing machine', 'refrigerator', 'fridge', 'microwave', 'tv repair', 'water purifier', 'ro service', 'geyser', 'chimney'],
      'pet-care': ['pet', 'dog', 'cat', 'vet', 'veterinary', 'dog grooming', 'pet spa', 'puppy', 'pet boarding', 'vaccination'],
      'home-services': ['ac', 'air conditioner', 'ac repair', 'electrician', 'switchboard', 'pest control', 'deep cleaning', 'house cleaning'],
      'auto-care': ['car', 'car wash', 'detailing', 'bike', 'motorcycle', 'ceramic', 'superbike', 'enfield', 'foam wash'],
    };

    for (const [catSlug, keywords] of Object.entries(categoryKeywords)) {
      for (const kw of keywords) {
        if (rawQuery.includes(kw)) {
          intent.detectedCategory = catSlug;
          matchScore += 25;
          break;
        }
      }
      if (intent.detectedCategory) break;
    }

    // 2. Detect Neighborhood in Dehradun
    for (const n of DEHRADUN_NEIGHBORHOODS) {
      if (n !== 'All Areas' && rawQuery.includes(n.toLowerCase())) {
        intent.detectedNeighborhood = n;
        matchScore += 25;
        break;
      }
    }

    // 3. Detect Date intent ("today", "tomorrow", "this saturday", "sunday", etc.)
    if (rawQuery.includes('today') || rawQuery.includes('tonight')) {
      intent.detectedDate = getTodayDateString();
      matchScore += 20;
    } else if (rawQuery.includes('tomorrow')) {
      intent.detectedDate = getTomorrowDateString();
      matchScore += 20;
    } else {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (let i = 0; i < days.length; i++) {
        if (rawQuery.includes(days[i])) {
          const targetDay = i;
          const today = new Date();
          const currentDay = today.getDay();
          let diff = targetDay - currentDay;
          if (diff <= 0) diff += 7;
          const nextDate = new Date();
          nextDate.setDate(today.getDate() + diff);
          intent.detectedDate = nextDate.toISOString().split('T')[0];
          matchScore += 20;
          break;
        }
      }
    }

    // 4. Detect Time intent ("after 6", "after 6 pm", "evening", "morning", "at 5")
    const timeMatch = rawQuery.match(/after\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i) ||
                      rawQuery.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);

    if (timeMatch) {
      let hour = parseInt(timeMatch[1], 10);
      const min = timeMatch[2] || '00';
      const meridian = timeMatch[3]?.toLowerCase();

      if (meridian === 'pm' && hour < 12) hour += 12;
      if (meridian === 'am' && hour === 12) hour = 0;
      if (!meridian && hour >= 1 && hour <= 8) {
        // assume PM for commercial evening bookings like "after 6"
        hour += 12;
      }

      intent.detectedTimeFrom = `${hour.toString().padStart(2, '0')}:${min}`;
      matchScore += 15;
    } else if (rawQuery.includes('evening') || rawQuery.includes('night')) {
      intent.detectedTimeFrom = '17:00';
      matchScore += 15;
    } else if (rawQuery.includes('morning')) {
      intent.detectedTimeFrom = '09:00';
      matchScore += 15;
    } else if (rawQuery.includes('afternoon')) {
      intent.detectedTimeFrom = '13:00';
      matchScore += 15;
    }

    // 5. Detect Price Cap ("under 800", "under 1000", "below 500", "under ₹500")
    const priceMatch = rawQuery.match(/(?:under|below|less than|within)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i) ||
                       rawQuery.match(/(\d+)\s*(?:rs|inr|rupees)/i);

    if (priceMatch) {
      intent.detectedMaxPrice = parseInt(priceMatch[1], 10);
      matchScore += 15;
    }

    // 6. Detect Rating ("top rated", "4+ star", "best")
    if (rawQuery.includes('best') || rawQuery.includes('top rated') || rawQuery.includes('5 star') || rawQuery.includes('high rating')) {
      intent.detectedRating = 4.5;
      matchScore += 10;
    }

    intent.confidence = Math.min(matchScore, 100);
    return intent;
  }

  /**
   * Converts parsed intent + explicit UI filters into unified SearchFilters object.
   */
  static buildFilters(rawQuery?: string, explicitFilters: Partial<SearchFilters> = {}): SearchFilters {
    const filters: SearchFilters = { ...explicitFilters };

    if (rawQuery) {
      const intent = this.parse(rawQuery);
      filters.query = rawQuery;

      if (!filters.category && intent.detectedCategory) {
        filters.category = intent.detectedCategory;
      }
      if (!filters.neighborhood && intent.detectedNeighborhood) {
        filters.neighborhood = intent.detectedNeighborhood;
      }
      if (!filters.date && intent.detectedDate) {
        filters.date = intent.detectedDate;
      }
      if (!filters.maxPrice && intent.detectedMaxPrice) {
        filters.maxPrice = intent.detectedMaxPrice;
      }
      if (!filters.minRating && intent.detectedRating) {
        filters.minRating = intent.detectedRating;
      }
    }

    return filters;
  }
}
