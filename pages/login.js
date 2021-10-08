import styles from '../styles/login.module.scss'
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { useContext, useState } from 'react';
import Link from 'next/link'
import { AuthContext } from '../contexts/AuthContext';


export default function Login() {
  const [passVisible, setPassVisible] = useState(false);
  const { signIn } = useContext(AuthContext)
  const schema = yup.object().shape({
    email: yup.string().email('O email é inválido').max(45, 'O email deve ter no máximo 45 caracteres').required('Este campo é obrigatório'),
    password: yup.string().max(100).required('Este campo é obrigatório'),
  })

  const { register, handleSubmit, formState: { errors }, setError } = useForm({resolver: yupResolver(schema)});



  const handleSignin = async (data) => {
    try{
      await signIn(data);
    }catch(e){
      if(e.error){
        setError("email", {
          type: "manual",
          message: e.message,
        })
        setError("password", {
          type: "manual",
          message: e.message,
        })
      }
    }
  }
  return(
    <div className={styles.container}>
        <div className={styles.content}>
          <form onSubmit={ handleSubmit(handleSignin) }>
            <div className={styles.left}>
              <h1>Login</h1>
              <div className={styles.inputs}>
                <div>
                  <label htmlFor="email">Email:</label>
                  <input style={{border : errors.email ? '1px solid red' : '1px solid rgba(0,0,0,0.3)'}} {...register('email')} type="email" name="email" id="email"  placeholder="Email"/>
                  <span className={styles.error}>{errors.email?.message}</span>
                </div>
                <div>
                  <label htmlFor="password">Senha:</label>
                  <div className={styles.passwordContainer}>
                    <input style={{border : errors.password ? '1px solid red' : '1px solid rgba(0,0,0,0.3)'}} {...register('password')} type={passVisible ? "text" : "password"} name="password" id="password"  placeholder="Senha"/>
                    <Icon onClick={()=>setPassVisible(!passVisible)} className={styles.icon} icon={ passVisible ? faEyeSlash : faEye }/>
                  </div>
                  <span className={styles.error}>{errors.password?.message}</span>
                </div>
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.divider}></div>
              <Link href="/signup">Ainda não tenho uma conta</Link>
              <div className={styles.imgContainer}>
                <img src="/presente.png" alt="Presente logo" />
                <span className={styles.name}>O que eu quero</span>
                <span className={styles.frase}>Escolha seus presentes e deixe que os outros se preocupem</span>
              </div>
              <input type="submit" value="Fazer login" />
            </div>
          </form>
        </div>
    </div>
  )
}
