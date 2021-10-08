import { forwardRef, useContext, useEffect, useState } from "react"
import { parseCookies } from "nookies";
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import Link from 'next/link'
import { withStyles, Tooltip, Switch, Slide, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Snackbar } from "@material-ui/core";
import { yupResolver } from '@hookform/resolvers/yup';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faTrash, faEdit, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'

import { AuthContext } from './../contexts/AuthContext';
import styles from '../styles/dashboard.module.scss'
import { addList, deleteList, getLists } from './../services/api';
import { MuiAlert } from '@material-ui/lab/Alert';




const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ColoredSwitch = withStyles({
  switchBase: {
    color: '#e8666d',
    '&$checked': {
      color: '#ad3d43',
    },
    '&$checked + $track': {
      backgroundColor: '#ad3d43',
    },
  },
  checked: {},
  track: {},
})(Switch);

export default function Dashboard({listsFromProps}) {
  const { user, isPremium } = useContext(AuthContext);
  const [lists, setLists] = useState(listsFromProps);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  

  const schema = yup.object().shape({
    name: yup.string().required('Este campo é obrigatório').max(45, 'O nome deve ter no máximo 45 caracteres'),
    ref: yup.string().required('Este campo é obrigatório').max(100, 'A referencia deve ter no máximo 45 caracteres'),
  })
  const { control, register, handleSubmit, formState: { errors }, setError } = useForm({resolver: yupResolver(schema)});




  async function handleAddList(data) {
    const res = await addList(data);
    if(res.error){
      setError("ref", {
        type: "manual",
        message: res.message,
      })
    }else{
      console.log(res)
      setLists((lists)=> [res, ...lists])
    }
  }
  async function handleDeleteList (id, i) {
    const deleted = await deleteList(id)
    if(deleted){
      const newLists = lists.filter((_,idx) => idx != i);
      setLists(newLists);
    }else{
      setSnackbarOpen(true)
    }
  }
  return (
    <div className={styles.container}>
    <div className={styles.content}>
        <div className={styles.left}>
          <h1>Bem vindo(a) <Link href="/me">{user ? user.name : "..."}</Link></h1>
          <form onSubmit={handleSubmit(handleAddList)} className={styles.inputs}>
            <h2>Adicionar lista</h2>
            <div>
              <div>
                <label htmlFor="name">Nome da lista:</label>
                <input style={{border : errors.name ? '1px solid red' : '1px solid rgba(0,0,0,0.3)'}} {...register('name')} type="text" name="name" id="name"  placeholder="Nome da lista"/>
                <span className={styles.error}>{errors.name?.message}</span>
              </div>
              <div>
                <div>
                  <label htmlFor="ref">Referência: &nbsp;</label>
                  <Tooltip title={<>
                    <span style={{fontSize:'9pt'}}>
                      A referencia é o que identifica sua lista <br />
                      Ex: oqueeuquero.com.br/list/suareferencia
                    </span>
                  </>} placement="top-start">
                    <i>
                    <Icon style={{color:'#666'}} icon={faQuestionCircle} />
                    </i>
                  </Tooltip>
                </div>
                <input style={{border : errors.ref ? '1px solid red' : '1px solid rgba(0,0,0,0.3)'}} {...register('ref')} type="text" name="ref" id="ref"  placeholder="Referencia"/>
                <span className={styles.error}>{errors.ref?.message}</span>
              </div>
            </div>
            <div className={styles.sliders}>
              <div>
                <label htmlFor="private">Privado:</label>
                <Tooltip
                disableHoverListener={isPremium}
                disableTouchListener={isPremium}
                disableFocusListener={isPremium}
                title={<>
                    <span style={{fontSize:'9pt'}}>
                    Funcionalidade restrita a usuários premium
                    </span>
                  </>} placement="top-start">
                    <div>
                      <Controller
                        defaultValue={false}
                        name="private"
                        id="private"
                        control={control}
                        render={({ field }) => (
                          <ColoredSwitch disabled={!isPremium} {...field} />
                        )}
                      />
                    </div>
                </Tooltip>
              </div>
              <div>
                <label htmlFor="showPix">Mostrar Pix:</label>
                <Tooltip
                disableHoverListener={isPremium}
                disableTouchListener={isPremium}
                disableFocusListener={isPremium}
                title={<>
                    <span style={{fontSize:'9pt'}}>
                    Funcionalidade restrita a usuários premium
                    </span>
                  </>} placement="top-start">
                    <div>
                      <Controller
                        defaultValue={false}
                        name="showPix"
                        id="showPix"
                        control={control}
                        render={({ field }) => (
                          <ColoredSwitch disabled={!isPremium} {...field} />
                        )}
                      />
                    </div>
                </Tooltip>
              </div>
              <div>
                <label htmlFor="showAddres">Mostrar endereço de entrega:</label>
                <Tooltip 
                disableHoverListener={isPremium}
                disableTouchListener={isPremium}
                disableFocusListener={isPremium}
                title={<>
                    <span style={{fontSize:'9pt'}}>
                    Funcionalidade restrita a usuários premium
                    </span>
                  </>} placement="top-start">
                    <div>
                      <Controller
                        defaultValue={false}
                        name="showAddres"
                        id="showAddres"
                        control={control}
                        render={({ field }) => (
                          <ColoredSwitch 
                          disabled={!isPremium} {...field} />
                        )}
                      />
                    </div>
                </Tooltip>
              </div>
            </div>
            <div className={styles.submit}>
              <input disabled={lists.length > 0 && !isPremium} style={lists.length > 0 && !isPremium ? {
                backgroundColor: '#ddd',
                color: "#bdbdbd",
                cursor: "default",
                border: 'none'
              } : {}} type="submit" value="Adicionar"/>
            </div>
          </form>

        </div>
        <div className={styles.right}>
          <div className={styles.divider} />
          <h2>Minhas Listas</h2>
          <div className={styles.listsContainer}>
            {lists.length > 0 ? (
              lists.map((v,i)=> <ListItem v={v} i={i} key={v.id} handleDeleteList={handleDeleteList}/>)
            ) : (
              <div className={styles.message}>
                Nenhuma lista adicionada ainda,<br />
                preencha os campos para adicionar uma!
              </div>
            )}
          </div>
        </div>
    </div>
    <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={(_,r)=>r === "clickaway" ? null : setSnackbarOpen(false)}
    anchorOrigin={{ vertical:'top', horizontal:'right' }}>
      <Alert onClose={(_,r)=>r === "clickaway" ? null : setSnackbarOpen(false)} severity="error">
        Algo deu errado, tente recarregar a página
      </Alert>
    </Snackbar>
</div>
  )
}

const ListItem = ({v,i,handleDeleteList}) => {
  const { isPremium } = useContext(AuthContext);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const date = new Date(v.created_at);
  const day = date.getDate().toString().length < 2 ? '0' + date.getDate() : date.getDate();
  const month = (date.getMonth() + 1).toString().length < 2 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
  const year = date.getFullYear();
  return(
    <div id={v.id} className={styles.list}>
      <div>
        <div className={styles.name}>{v.name}</div>
        <div className={styles.ref}><Link href={`/list/${v.ref}`}>{`/${v.ref}`}</Link></div>
      </div>
      <div>
        <div className={styles.date}>
          {`${day}/${month}/${year}`}
        </div>
        <div><Icon className={styles.trash} icon={faTrash} onClick={()=>{
          setOpenDeleteDialog(true)
        }}/></div>
        <div>
          <Link href={`/edit/${v.ref}`}>
            <i>
              <Icon className={styles.edit} icon={faEdit}/>
            </i>
          </Link>
        </div>
      </div>
      <Dialog
        open={openDeleteDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={()=>setOpenDeleteDialog(false)}
      >
        {
          isPremium ? (
            <>
            <DialogTitle>Você tem certeza?</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Você não poderá desfazer esta ação!
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={()=>setOpenDeleteDialog(false)} color="primary">
                Cancelar
              </Button>
              <Button onClick={()=>{
                handleDeleteList(v.id, i)
                setOpenDeleteDialog(false)
              }} color="primary">
                Deletar Item
              </Button>
            </DialogActions>
            </>
          ):(
            <>
            <DialogTitle>Funcionalidade Premium</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Somente usuários premium podem deletar listas
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={()=>setOpenDeleteDialog(false)} color="primary">
                Cancelar
              </Button>
            </DialogActions>
            </>
          )
        }

      </Dialog>
    </div>
  )
}


export const getServerSideProps = async (ctx) => {
  const { 'oqueeuquero.token' : token } = parseCookies(ctx);
  const lists = await getLists(token);
  if(!token){
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }
  return {
    props: {
      listsFromProps: lists
    }
  }
}