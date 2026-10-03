import { NextResponse } from "next/server";

type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  footway?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

type NominatimResponse = {
  display_name?: string;
  address?: NominatimAddress;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and longitude are required." },
      { status: 400 },
    );
  }

  const latitude = Number(lat);
  const longitude = Number(lon);

  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return NextResponse.json(
      { error: "Invalid coordinates." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        latitude,
      )}&lon=${encodeURIComponent(
        longitude,
      )}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "NOVA-Ecommerce/1.0",
          "Accept-Language": "en",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Reverse geocoding failed.");
    }

    const data = (await response.json()) as NominatimResponse;
    const location = data.address ?? {};

    const street = [
      location.house_number,
      location.road ||
        location.pedestrian ||
        location.footway,
    ]
      .filter(Boolean)
      .join(" ");

    const district =
      location.neighbourhood ||
      location.suburb ||
      "";

    const address =
      [street, district].filter(Boolean).join(", ") ||
      data.display_name ||
      "";

    const city =
      location.city ||
      location.town ||
      location.village ||
      location.municipality ||
      location.county ||
      "";

    return NextResponse.json({
      address,
      city,
      region: location.state || "",
      postalCode: location.postcode || "",
      country: location.country || "",
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to find the address for this location.",
      },
      { status: 500 },
    );
  }
}
