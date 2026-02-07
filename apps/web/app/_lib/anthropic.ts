import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const LOYALTY_PROGRAM_PARSE_PROMPT = `Analyze this image/text containing loyalty program information.

Extract each loyalty program and return as a JSON array with these fields:
- programName: The official program name (e.g., "Delta SkyMiles", "Hilton Honors")
- programType: One of "airline", "hotel", "car_rental", "credit_card", "other"
- accountNumber: The membership/account number if visible
- membershipTier: Tier level if mentioned (e.g., "Gold", "Platinum")
- notes: Any other relevant info (emails, usernames, secondary IDs, etc.)

Infer programType from the program name:
- Airlines: Delta, United, American, Southwest, JetBlue, Alaska, Virgin, Korean Air, Singapore Airlines, ANA, Hawaiian, Northwest, etc. → "airline"
- Hotels: Hilton, Marriott, Hyatt, IHG, Wyndham, Starwood, Kimpton, etc. → "hotel"
- Car Rental: National, Enterprise, Hertz, Avis, Budget, etc. → "car_rental"
- Credit Cards: Chase, Amex, Citi, Capital One, etc. → "credit_card"
- Travel aggregators like Expedia should be "other"

Return ONLY valid JSON array, no markdown code blocks or explanation. Example format:
[{"programName":"Delta SkyMiles","programType":"airline","accountNumber":"123456","membershipTier":null,"notes":"user@email.com"}]`;
