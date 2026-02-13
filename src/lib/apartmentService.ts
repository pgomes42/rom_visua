import { Apartment, apartments as initialApartments } from "@/data/apartments";

const STORAGE_KEY = "roomview_apartments";

export const apartmentService = {
    // Get all apartments
    getApartments(): Apartment[] {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            // If no data in storage, initialize with default apartments
            this.saveApartments(initialApartments);
            return initialApartments;
        }
        return JSON.parse(data);
    },

    // Save apartments
    saveApartments(apartments: Apartment[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(apartments));
    },

    // Add a new apartment
    addApartment(apartment: Omit<Apartment, "id">): Apartment {
        const apartments = this.getApartments();
        const newApartment: Apartment = {
            ...apartment,
            id: "apt-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        };
        apartments.push(newApartment);
        this.saveApartments(apartments);
        return newApartment;
    },

    // Update an existing apartment
    updateApartment(id: string, data: Partial<Apartment>): boolean {
        const apartments = this.getApartments();
        const index = apartments.findIndex((a) => a.id === id);
        if (index === -1) return false;

        apartments[index] = { ...apartments[index], ...data };
        this.saveApartments(apartments);
        return true;
    },

    // Delete an apartment
    deleteApartment(id: string): boolean {
        const apartments = this.getApartments();
        const newApartments = apartments.filter((a) => a.id !== id);
        if (newApartments.length === apartments.length) return false;

        this.saveApartments(newApartments);
        return true;
    },
};
