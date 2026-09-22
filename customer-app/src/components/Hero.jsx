import {
  ArrowRight,
  Package,
  Phone,
  ShieldCheck,
  Truck
} from "lucide-react";

import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-background-shape"></div>

      <div className="hero-container">

        {/* LEFT SIDE */}

        <div className="hero-content">

          <div className="hero-badge">

            <span className="hero-badge-dot"></span>

            Reliable Construction Rentals

          </div>


          <h1>

            Rent Construction
            <br />

            <span>
              Materials & Machines
            </span>

            <br />

            Easily

          </h1>


          <p className="hero-description">

            Quality centering materials, scaffolding
            hardware, construction machines and tools
            available for reliable daily rental.

          </p>


          <div className="hero-actions">

            <Link
              to="/products"
              className="primary-button"
            >

              <Package size={18} />

              Browse Products

              <ArrowRight size={17} />

            </Link>


            <Link
              to="/contact"
              className="secondary-button"
            >

              <Phone size={17} />

              Contact Us

            </Link>

          </div>


          {/* TRUST FEATURES */}

          <div className="hero-features">

            <div className="hero-feature">

              <ShieldCheck size={19} />

              <span>
                Quality Equipment
              </span>

            </div>


            <div className="hero-feature">

              <Truck size={19} />

              <span>
                Flexible Rentals
              </span>

            </div>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="hero-visual">

          <div className="hero-visual-card">

            <div className="construction-icon">

              <span className="building-block block-one"></span>

              <span className="building-block block-two"></span>

              <span className="building-block block-three"></span>

              <span className="building-block block-four"></span>

            </div>


            <div className="hero-visual-text">

              <strong>
                Construction
              </strong>

              <span>
                Equipment Rental
              </span>

            </div>


            <div className="hero-visual-line"></div>


            <div className="hero-visual-price">

              <span>
                Starting from
              </span>

              <strong>
                ₹40/day
              </strong>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;