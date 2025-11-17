interface PlanPriceBand {
  id?: number;
  plan_code?: string;
  plan_id?: number;
  age_band?: string;
  min_age?: number;
  max_age?: number;
  base_premium?: number;
  per_extra_day_rate?: number;
}

export interface PlanDetails {
  id?: number;
  plan_code?: string;
  display_name?: string;
  trip_days_cap?: number;
  [key: string]: any;
}

export interface PolicyFormData {
  // Contact Details
  travellingSaudiWith: string;
  travelAgencyName: string;
  name: string;
  phone: string;
  email: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nextOfKinEmail: string;

  // Travel Details
  departureDate: string; // Date of departure (from Singapore)
  arrivalDate: string; // Date of arrival (in Singapore)
  numberOfDays: string;
  destination: string;
  umrahCoveragePlan: string;
  countryOfTravel: string;
  selectedPlanDisplayName: string;
  selectedPlanCode: string;
  coveragePlanDetailsText: string;
  selectedPlanDetails: PlanDetails | null;
  planAdultPricing: PlanPriceBand | null;
  planChildPricing: PlanPriceBand | null;
  adults: number;
  children: number;

  // Customer Details (array for multiple customers)
  customers: Array<{
    fullName: string;
    passportNumber: string;
    nationality: string;
    gender: string;
    dateOfBirth: string;
    isChild: boolean; // true for children, false for adults
  }>;

  // Notice & Declaration
  importantNoticeDeclaration: boolean;
  pdpaConsent: boolean;
  freeIndependentTraveller: boolean;
  notDischargedWithin30Days: boolean;
  confirmInformationAccurate: boolean;

  // Payment
  referralCode: string;
  insuranceTotal: string;

  // Payment Details
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
  billingAddress: string;
  transactionId: string;
}

