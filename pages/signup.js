import styles from '../styles/signup.module.scss'
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { useContext, useState } from 'react';
import Link from 'next/link'
import { AuthContext } from '../contexts/AuthContext';


export default function Signup() {
  const [passVisible, setPassVisible] = useState(false);
  const { signUp } = useContext(AuthContext)
  const schema = yup.object().shape({
    name: yup.string().required('Este campo é obrigatório').min(3, 'O nome deve ter no mínimo 3 caracteres').max(50, 'O nome deve ter no máximo 50 caracteres'),
    email: yup.string().required('Este campo é obrigatório').email('O email é inválido').max(45, 'O email deve ter no máximo 45 caracteres'),
    password: yup.string().required('Este campo é obrigatório').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,100}$/, 
    'A senha deve ter no mínimo 8 caracteres, sendo um letra minuscula, um letra maiúscula e um número'),
    passwordconfirm: yup.string().required('Este campo é obrigatório').oneOf([yup.ref('password'), null], "As senhas não conferem"),
  })

  const { register, handleSubmit, formState: { errors }, setError } = useForm({resolver: yupResolver(schema)});



  const handleSignup = async (data) => {
    try{
      await signUp(data);
    }catch(e){
      if(e.error){
        setError("email", {
          type: "manual",
          message: e.message,
        })
      }
    }
  }
  return(
    <div className={styles.container}>
        <div className={styles.content}>
          <form onSubmit={ handleSubmit(handleSignup) }>
            <div className={styles.left}>
              <h1>Cadastro</h1>
              <div className={styles.inputs}>
                <div>
                  <label htmlFor="name">Nome Completo:</label>
                  <input style={{border : errors.name ? '1px solid red' : '1px solid rgba(0,0,0,0.3)'}} {...register('name')} type="text" name="name" id="name" placeholder="Nome Completo" />
                  <span className={styles.error}>{errors.name?.message}</span>
                </div>

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
                <div>
                  <label htmlFor="passwordconfirm">Confirmar Senha:</label>
                  <div className={styles.passwordContainer}>
                    <input style={{border : errors.passwordconfirm ? '1px solid red' : '1px solid rgba(0,0,0,0.3)'}} {...register('passwordconfirm')} type={passVisible ? "text" : "password"} name="passwordconfirm" id="passwordconfirm"  placeholder="Confirmar Senha"/>
                    <Icon onClick={()=>setPassVisible(!passVisible)} className={styles.icon} icon={ passVisible ? faEyeSlash : faEye }/>
                  </div>
                  <span className={styles.error}>{errors.passwordconfirm?.message}</span>
                </div>
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.divider}></div>
              <Link href="/login">Já tenho uma conta</Link>
              <div className={styles.imgContainer}>
                <img src="/presente.png" alt="Presente logo" />
                <span className={styles.name}>O que eu quero</span>
                <span className={styles.frase}>Escolha seus presentes e deixe que os outros se preocupem</span>
              </div>
              <input type="submit" value="Criar Conta" />
            </div>
          </form>
        </div>
    </div>
  )
}
