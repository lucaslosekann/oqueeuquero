import { createContext, useEffect, useState } from "react";
import { api, recoverUserInfo, signin, signup } from "../services/api";
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import Router from 'next/router'
export const AuthContext = createContext({});

export function AuthProvider({ children }){
  

  const [user, setUser] = useState(null)
  const [isPremium, setIsPremium] = useState(false);
  const isAuthenticated = !!user;
  useEffect(() => {
    setIsPremium(user?.role === 'premium');
  },[user])

  useEffect(async () => {
    const { 'oqueeuquero.token' : token } = parseCookies();
    if(token){
      try{
        const user = await recoverUserInfo(token)
        setUser(user);
      }catch(e){
        destroyCookie(undefined, 'oqueeuquero.token')
        if(Router.asPath.split('/list')[0] !== "") Router.push('/login');

      }
    }
  },[])

  function signUp ({email, password, name}){
    return new Promise(async(resolve,reject) => {
      try{
        const { token, user } = await signup({
          email,
          password,
          name
        });
        setCookie(undefined, 'oqueeuquero.token', token, {
          maxAge: 60 * 60 * 24 * 59 //59 dias
        })
        setUser(user);
        Router.push('/dashboard');
      }catch(e){
        reject(e);
      }
    })

  }

  function signIn ({email, password}){
    return new Promise(async (resolve, reject) => {
      try{
        const { token, user } = await signin({
          email,
          password
        });

        setCookie(undefined, 'oqueeuquero.token', token, {
          maxAge: 60 * 60 * 24 * 59 //59 dias
        })
        api.defaults.headers['Authorization'] = 'Bearer ' + token;
        setUser(user);
        Router.push('/dashboard')
      }catch(e){
        reject(e);
      }
    })
  }
  
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      signIn,
      signUp,
      user,
      isPremium
    }}>
      { children } 
    </AuthContext.Provider>
  )
}