import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { salonToday } from "@/lib/availability";
import { getCatalog } from "@/lib/catalog";
import { bookingEnabled, paymentsEnabled } from "@/lib/config";
import { BookingForm } from "./BookingForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Book an appointment" };

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const catalog = await getCatalog();
  return (
    <>
      <PageHeader eyebrow="Book online" title="Book your appointment" intro="Choose your style, pick a time, and we'll confirm on WhatsApp." />
      <div className="container-page py-10">
        <BookingForm
          catalog={catalog}
          initialServiceId={service}
          today={salonToday()}
          bookingEnabled={bookingEnabled}
          paymentsEnabled={paymentsEnabled}
        />
      </div>
    </>
  );
}
