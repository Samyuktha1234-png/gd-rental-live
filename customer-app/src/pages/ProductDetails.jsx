import { Link, useParams } from "react-router-dom";
import products from "../data/products";

function ProductDetails() {

  const { id } = useParams();

  const product = products.find(
    (item) => item.id === Number(id)
  );


  if (!product) {

    return (

      <div className="not-found">

        <h1>
          Equipment Not Found
        </h1>

        <Link to="/products">
          ← Back to Products
        </Link>

      </div>

    );

  }


  return (

    <div className="product-details-page">


      {/* BREADCRUMB */}

      <div className="details-container">

        <div className="breadcrumb">

          <Link to="/">
            Home
          </Link>

          <span>
            /
          </span>

          <Link to="/products">
            Products
          </Link>

          <span>
            /
          </span>

          <span>
            {product.name}
          </span>

        </div>



        {/* DETAILS */}

        <div className="product-details-grid">


          {/* VISUAL */}

          <div className="details-visual">

            <div className="details-main-visual">

              <span>
                {product.icon}
              </span>

            </div>

          </div>



          {/* INFORMATION */}

          <div className="details-information">

            <span className="details-category">
              {product.category}
            </span>


            <h1>
              {product.name}
            </h1>


            <div className="details-rating">

              <span>
                ★★★★★
              </span>

              <span>
                Professional Construction Equipment
              </span>

            </div>


            <p className="details-description">
              {product.description}
            </p>



            {/* PRICE */}

            <div className="details-price">

              <strong>
                ₹{product.price}
              </strong>

              <span>
                {product.unit}
              </span>

            </div>



            {/* AVAILABILITY */}

            <div className="details-availability">

              <span className="availability-dot">
                ●
              </span>

              Equipment Available for Rental

            </div>



            {/* FEATURES */}

            <div className="details-features">

              <h3>
                Equipment Features
              </h3>


              <div className="details-feature-grid">

                {product.features.map((feature) => (

                  <div
                    key={feature}
                    className="details-feature"
                  >

                    <span>
                      ✓
                    </span>

                    {feature}

                  </div>

                ))}

              </div>

            </div>



            {/* ACTIONS */}

            <div className="details-actions">

              <Link
                to={`/booking?product=${product.id}`}
                className="primary-button"
              >
                Book This Equipment
              </Link>


              <Link
                to="/products"
                className="secondary-button"
              >
                ← Continue Browsing
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default ProductDetails;