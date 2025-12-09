import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedImage, setSelectedImage] = useState(null);

  const openImage = (src, alt) => {
    setSelectedImage({ src, alt });
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="space-y-12">

        {/* Hero Section (Static Image) */}
        <section className="relative w-full h-[70vh] overflow-hidden flex justify-center items-center text-center">
          <img
            src="/images/Tigray_river.png"   // ← your static hero image
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black bg-opacity-40"></div>

          <div className="relative z-10 px-6 py-4 rounded-lg">
            <h3 className="text-8xl font-bold mb-2 drop-shadow-2xl text-white">
              Hwasat
            </h3>
            <p className="text-white drop-shadow-xl text-3xl">
              Welcome to Hwasat Geosense! <br />
              Remote Sensing &amp; Environmental Consultancy
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section className="main-page px-4 py-8">
          <h1 className="text-2xl font-semibold mb-6 text-center max-w-4xl mx-auto">
            We provide specialised consultancy services in remote sensing and GIS
            applications tailored to Ethiopia’s environmental challenges. Beyond
            our online tools, we support organisations, researchers, and
            policymakers with offline analysis services, including:
          </h1>

          <ul className="main-services">
            <li className="service-item">
              <div className="text-content text-center mb-4">
                <h3 className="font-semibold text-lg">Supervised classification</h3>
                <p className="text-sm text-gray-600">
                  using client-provided ground truth data
                </p>
              </div>
              <img
                src="/images/southern_tigray_lc_3d.png"
                alt="Supervised classification"
                className="service-image"
                onClick={() =>
                  openImage(
                    "/images/southern_tigray_lc_3d.png",
                    "Supervised classification"
                  )
                }
              />
            </li>

            <li className="service-item">
              <div className="text-content text-center mb-4">
                <h3 className="font-semibold text-lg">MLB</h3>
                <p className="text-sm text-gray-600">
                  Machine learning–based environmental mapping
                </p>
              </div>
              <img
                src="/images/Humera.jpg"
                alt="MLB"
                className="service-image"
                onClick={() => openImage("/images/Humera.jpg", "MLB")}
              />
            </li>

            <li className="service-item">
              <div className="text-content text-center mb-4">
                <h3 className="font-semibold text-lg">Ready-to-use outputs</h3>
                <p className="text-sm text-gray-600">
                  such as high-resolution maps, statistics, and reports
                </p>
              </div>
              <img
                src="/images/aa_stad_lidar_3d.png"
                alt="Ready-to-use outputs"
                className="service-image"
                onClick={() =>
                  openImage(
                    "/images/aa_stad_lidar_3d.png",
                    "Ready-to-use outputs"
                  )
                }
              />
            </li>
          </ul>
        </section>

        {/* Maps Section */}
        <section className="bg-gray-200 p-8 rounded-lg shadow-md flex justify-center">
          <div className="map flex flex-col md:flex-row items-center gap-6 max-w-4xl">
            <div className="flex-1 text-center md:text-center">
              <h2 className="text-3xl font-semibold mb-2 text-green-800">
                Visualize and download products
              </h2>
              <p className="text-2xl text-gray-600 mb-4">
                Explore our interactive dashboard for visualizing and downloading
                satellite-derived outputs. Access geospatial datasets derived from
                Sentinel-2, Landsat, MODIS, vegetation indices, drought indices,
                and land cover maps.
              </p>

              <Link
                to="/maps"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-700"
              >
                Explore Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Data Resources */}
        <section className="flex justify-center bg-gray-200 p-8 rounded-lg shadow-md">
          <div className="data flex flex-col items-center max-w-4xl text-center md:text-center">
            <h2 className="text-3xl font-semibold mb-2 text-green-800">
              Data Resources
            </h2>
            <p className="text-2xl text-gray-600 mb-4">
              Access Ethiopia’s complete administrative boundary datasets, from
              national to district level, available in SHP, GPKG, and GeoJSON.
            </p>

            <Link
              to="/data"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-700"
            >
              Explore Data Resources
            </Link>
          </div>
        </section>

        {/* Footer Message */}
        <section className="flex justify-center bg-gray-50 p-8 rounded-lg shadow-md">
          <div className="footer-content max-w-4xl text-center md:text-left">
            <p className="text-xl text-gray-600">
              Whether you are a government agency, NGO, researcher, or private
              business, we are committed to transforming your data into accurate,
              actionable, and decision-ready solutions.
            </p>
          </div>
        </section>
      </div>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImage}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
            >
              <span className="text-xl">&times;</span>
            </button>

            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
