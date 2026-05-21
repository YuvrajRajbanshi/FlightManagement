export type Database = {
  public: {
    Tables: {
      flights: {
        Row: {
          id: string;
          airline: string;
          origin: string;
          destination: string;
          departure_time: string;
          arrival_time: string;
          price: number;
          capacity: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["flights"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["flights"]["Insert"]>;
      };
      seats: {
        Row: {
          id: string;
          flight_id: string;
          seat_number: string;
          status: "available" | "reserved" | "booked";
          user_id: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["seats"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["seats"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          flight_id: string;
          status: "confirmed" | "rescheduled" | "cancelled";
          pnr: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["bookings"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
      passengers: {
        Row: {
          id: string;
          booking_id: string;
          name: string;
          passport_number: string;
          nationality: string;
          date_of_birth: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["passengers"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["passengers"]["Insert"]>;
      };
      reschedules: {
        Row: {
          id: string;
          booking_id: string;
          old_flight_id: string;
          new_flight_id: string;
          rescheduling_fee: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["reschedules"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["reschedules"]["Insert"]>;
      };
    };
  };
};
