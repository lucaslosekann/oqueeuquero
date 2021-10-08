import router from 'next/router';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../contexts/AuthContext';
import { createStripeSession } from '../services/api';
export default function Prices(){
  const premiumForm = useForm();
  const { user } = useContext(AuthContext);
  async function createSession(data){
    if(!user){
      router.push('/login')
    }else{
      createStripeSession(data)
    }
  }
  return (
    <div>
      <section>
        <div>
          <div>
            <h3>Plano Premium</h3>
            <h5>R$5,00 / mês</h5>
          </div>
        </div>
        <form onSubmit={premiumForm.handleSubmit(createSession)}>
          <input {...premiumForm.register('priceId')} type="hidden" name="priceId" value="price_1JXEJ6JZSX1wgth6tYK6o2iQ" />
          <button id="checkout-and-portal-button" type="submit">
            Checkout
          </button>
        </form>
      </section>
    </div>
  )
}