import React, { useState, useEffect } from 'react'
import './Payment.css'
import { Link, useHistory } from "react-router-dom";
import { useStateValue } from '../providers/StateProvider'
import CheckoutProduct from './CheckoutProduct';
import { CardElement, useStripe, useElements} from '@stripe/react-stripe-js'
import { getBasketTotal } from "../reducers/reducer";
import axios from '../axios/axios';
import CurrencyFormat from "react-currency-format";

function Payment() {
  const [{ basket, user }, dispatch] = useStateValue();

  const history = useHistory();

  const [error, setError] = useState(null)
  const [disabled, setDisabled] = useState(true)
  const [processing, setProcessing] = useState('')
  const [succeded, setSucceded] = useState(false) 
  const [clientSecret, setClientSecret] = useState(true) 

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const getClientSecret = async () => {
      const response = await axios({
        method: 'post',
        // Stripe expects the total in a currency subunits ex($10.00 = 1000)
        url: `/payments/create?total=${ getBasketTotal(basket) * 100}`
      });
      setClientSecret(response.data.clientSecret)
    }
    getClientSecret();
  }, [basket])

  console.log('THE SECRET IS >>>', clientSecret)

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    }).then(({ paymentIntent }) => {

      setSucceded(true);
      setError(null);
      setProcessing(false);

      history.replace('/orders')
    })
  }
  const handleChange = (event) => {
    setDisabled(event.empty);
    setError(event.error ? event.error.message : '');
  }

  return (
    <div className='payment'>
      <div className="payment_container">
        <h1>
          Checkout (<Link to='/checkout'>{basket?.length} items</Link>)
        </h1>
        {/* delivery address */}
        <div className="payment_section">
          <div className="payment_title">
            <h3>Delivery address</h3>
          </div>
          <div className="payment_address">
            <p>{user?.email}</p>
            <p>address</p>
            <p>city</p>
          </div>
        </div>
        {/* review items */}
        <div className="payment_section">
          <div className="payment_title">
            <h3>Review items and delievery</h3>
          </div>
          <div className="payment_items">
            {basket.map(item => (
              <CheckoutProduct
                id= {item.id}
                title= {item.title}
                image= {item.image}
                price= {item.price}
                rating= {item.rating}
              />
            ))}
          </div>
        </div>
        {/* payment method */}
        <div className="payment_section">
          <div className="payment_title">
              <h3>Payment Method</h3>
          </div>
          <div className="payment_details">
              <form onSubmit={handleSubmit}>
                <CardElement onChange={handleChange} />
                <div className="payment_priceContainer">
                  <CurrencyFormat
                    renderText={(value) => (
                      <h3>Order Total: {value}</h3>
                    )}
                    decimalScale={2}
                    value={getBasketTotal(basket)}
                    displayType={"text"}
                    thousandSeparator={true}
                    prefix={"$"}
                  />
                  <button disabled={processing || disabled || succeded}>
                    <span>{processing ? <p>Processing</p> : 'Buy Now'}</span>
                  </button>
                </div>
                {/*  Error handling */}
                {error && <div>{error}</div>}
              </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment
