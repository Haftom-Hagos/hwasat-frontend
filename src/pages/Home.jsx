import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const heroImages = [
    { src: "/images/img.png", alt: "Vegetation monitoring" },
    { src: "/images/img1.png", alt: "Satellite land cover map" },
    { src: "/images/img2.png", alt: "Environmental monitoring" },
  ];

  const slides = [...heroImages, ...heroImages];

  return (
    <div className="space-y-16">

      {/* HERO SECTION */}

      <section className="relative overflow-hidden text-center w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">

        <div className="absolute inset-y-0 left-0">
          <div className="slider-wrapper">
            {slides.map((image, index) => (
              <div key={index} className="slide flex justify-center items-center h-full w-full bg-black">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-center items-center z-10 px-6">

          <h1 className="text-7xl font-bold text-white drop-shadow-2xl mb-6">
            Hwasat
          </h1>

          <p className="text-2xl md:text-3xl text-white max-w-3xl drop-shadow-xl mb-8">
            A platform for exploring and downloading satellite-derived
            vegetation indices and land cover data.
          </p>

          <Link
            to="/maps"
            className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg shadow-lg hover:bg-green-700 transition"
          >
            Explore Satellite Data
          </Link>

        </div>
      </section>

      {/* VALUE SECTION */}

      <section className="max-w-6xl mx-auto px-6 text-center">

        <h2 className="text-4xl font-bold text-gray-800 mb-6">
          Satellite data made accessible
        </h2>

        <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
          Earth observation satellites generate enormous amounts of environmental
          data, but accessing and preparing these datasets often requires
          advanced technical skills. Hwasat simplifies this process by allowing
          users to directly visualize and download vegetation indices, drought
          indicators, and land cover maps derived from multiple satellite
          missions.
        </p>

      </section>

      {/* FEATURES */}

      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">

        <div className="bg-gray-50 p-8 rounded-xl shadow-md">
          <h3 className="text-2xl font-semibold mb-4 text-green-700">
            Vegetation Monitoring
          </h3>

          <p className="text-gray-600">
            Explore vegetation indices such as NDVI and EVI derived from
            satellite imagery to analyze vegetation health and landscape
            dynamics.
          </p>
        </div>

        <div className="bg-gray-50 p-8 rounded-xl shadow-md">
          <h3 className="text-2xl font-semibold mb-4 text-green-700">
            Land Cover Mapping
          </h3>

          <p className="text-gray-600">
            Access land cover maps to understand environmental patterns,
            ecosystem distribution, and land use change.
          </p>
        </div>

        <div className="bg-gray-50 p-8 rounded-xl shadow-md">
          <h3 className="text-2xl font-semibold mb-4 text-green-700">
            Ready-to-Use Data
          </h3>

          <p className="text-gray-600">
            Download processed datasets instantly without the need for complex
            preprocessing or specialized GIS workflows.
          </p>
        </div>

      </section>

      {/* DASHBOARD SECTION */}

      <section className="bg-gray-100 py-12">

        <div className="max-w-5xl mx-auto text-center px-6">

          <h2 className="text-4xl font-semibold text-gray-800 mb-6">
            Explore the interactive dashboard
          </h2>

          <p className="text-xl text-gray-600 mb-8">
            The Hwasat dashboard enables users to visualize and download
            satellite-derived environmental products including vegetation
            indices, drought indicators, and land cover datasets derived from
            Sentinel-2, Landsat, and MODIS imagery.
          </p>

          <Link
            to="/maps"
            className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg shadow hover:bg-green-700 transition"
          >
            Launch Dashboard
          </Link>

        </div>

      </section>

      {/* DATA RESOURCES */}

      <section className="max-w-5xl mx-auto text-center px-6">

        <h2 className="text-3xl font-semibold text-green-800 mb-4">
          Data Resources
        </h2>

        <p className="text-xl text-gray-600 mb-6">
          Access Ethiopia’s administrative boundary datasets from national to
          district level, available in multiple geospatial formats including
          SHP, GPKG, and GeoJSON.
        </p>

        <Link
          to="/data"
          className="bg-green-600 text-white px-6 py-3 rounded-md shadow hover:bg-green-700"
        >
          Browse Data
        </Link>

      </section>

      {/* FINAL MESSAGE */}

      <section className="bg-gray-50 py-12 text-center">

        <p className="text-xl text-gray-600 max-w-4xl mx-auto px-6">
          Hwasat aims to simplify access to satellite-derived environmental
          information, enabling researchers, organisations, and policymakers to
          better understand vegetation dynamics and land cover change.
        </p>

      </section>

    </div>
  );
}
