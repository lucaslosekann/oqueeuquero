import { forwardRef, useContext, useEffect, useState } from "react"
import { parseCookies } from "nookies";
import * as yup from 'yup';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { Checkbox, Slide, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Snackbar } from "@material-ui/core";
import { yupResolver } from '@hookform/resolvers/yup';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons'
import MuiAlert from '@material-ui/lab/Alert';
import { AuthContext } from './../../contexts/AuthContext';
import styles from '../../styles/edit.module.scss'
import { addListItem, api, deleteListItem, uncheck } from './../../services/api';
import Link from 'next/link';


const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}


export default function EditList({list:{list, name: listName, id: listId}, listRef}) {
  const { user, isPremium } = useContext(AuthContext);
  const [listItems, setListItems] = useState(list);
  const [snackbarOpen, setSnackbarOpen] = useState(false);


  const schema = yup.object().shape({
    description: yup.string().required('Este campo é obrigatório').max(50, 'O nome deve ter no máximo 50 caracteres'),
  })

  const { control, register, handleSubmit, formState: { errors, isSubmitSuccessful }, setError, reset } = useForm({
    defaultValues: {
      links: [{ value: "" }]
    },
    resolver: yupResolver(schema)
  });

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
    control,
    name: "links", 
  });



  const watchLinks = useWatch({control, name: 'links'})
  useEffect(() => { 
    if(watchLinks[0] != ""){
      if(watchLinks[watchLinks.length-1].value != ""){
        if(watchLinks.length >= 10)return;
        append({value: ''})
      }
    }
      watchLinks.map(({value},i)=>{
        if(value == "" && i != 0 && i != watchLinks.length-1 ){
          remove(i);
        }
      })
    
  }, [watchLinks]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({ description: '', links: [{value: ''}]});
    }
  }, [isSubmitSuccessful, reset]);

  async function deleteItem (id,i) {
    const deleted = await deleteListItem(id)
    if(deleted){
      const newItems = listItems.filter((_,idx) => idx != i);
      setListItems(newItems);
    }else{
      setSnackbarOpen(true)
    }
  }

  async function handleAddListItem(data) {
    data.links = data.links.reduce((acc, {value}) => {
      if(value !== "")acc.push(value)
      return acc;
    },[])
    const id = await addListItem(data, listId);
    data.id = id
    data.checked = 0;
    setListItems([...listItems, data])
    // if(res.error){
    //   setError("ref", {
    //     type: "manual",
    //     message: res.message,
    //   })
    // }else{
    //   console.log(res)
    //   setLists((lists)=> [res, ...lists])
    // }
  }
  return (
    <div className={styles.container}>
    <div className={styles.content}>
        <div className={styles.left}>
        <h1><Link href={`/list/${listRef}`}>{listName}</Link></h1>
          <form onSubmit={handleSubmit(handleAddListItem)} className={styles.inputs}>
            <h2>Adicionar item na lista</h2>
            <div>
              <div>
                <label htmlFor="description">Descrição:</label>
                <input style={{border : errors.description ? '1px solid red' : '1px solid rgba(0,0,0,0.3)'}} {...register('description')} type="text" name="description" id="description"  placeholder="Descrição"/>
                <span className={styles.error}>{errors.description?.message}</span>
              </div>
              <div className={styles.links}>
                <label htmlFor="Links">Links:</label>
                <div>
                  {fields.map((field, index) => (
                    <Controller
                    key={field.id}
                    name={`links.${index}.value`}
                    control={control}
                    defaultValue=""
                    render={({ field })=>(<input {...field} placeholder={`Link ${index+1}`}/>)}
                    />
                  ))}
                </div>
              </div>

            </div>
            <div className={styles.submit}>
              <input type="submit" value="Adicionar"/>
            </div>
          </form>

        </div>
        <div className={styles.right}>
          <div className={styles.divider} />
          <h2>Meus itens</h2>
          <div className={styles.listsContainer}>
            {listItems.length > 0 ? (
              listItems.map((v,i)=>
              <ListItem 
                listItems={listItems}
                setListItems={setListItems}
                key={v.id} 
                v={{v,i}}
                deleteItem={deleteItem}
                setSnackbarOpen={setSnackbarOpen}
              />)
            ) : (
              <div className={styles.message}>
                Nenhum item adicionado ainda,<br />
                preencha os campos para adicionar um!
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




const ListItem = ({v: {v,i}, deleteItem, setSnackbarOpen})=>{
  const [checked, setChecked] = useState(v.checked)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  async function handleChange(){
    const {updated, checked} = await uncheck(v.id)
    if(updated){
      setChecked(!!checked)
    }else{
      setSnackbarOpen(true)
    }
  }
  return(
    <div id={v.id} className={styles.list}>
      <div className={styles.leftContainer}>
        <Checkbox 
          checked={!!checked}
          onChange={handleChange}
        />
        <div>
          <div className={styles.name}>{v.description}</div>
          <div className={styles.ref}>{v.links ? v.links.length : 0} links</div>
        </div>
      </div>
      <div>
        <div>
          <Icon className={styles.trash} icon={faTrash} onClick={()=>{
            setOpenDeleteDialog(true)
          }}/>
        </div>
        <div>
          <Icon className={styles.edit} icon={faEdit} onClick={()=>{
            //ABRE UM MODAL DE EDICAO
          }}/>
        </div>
      </div>
      <Dialog
        open={openDeleteDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={()=>setOpenDeleteDialog(false)}
      >
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
            deleteItem(v.id, i);
            setOpenDeleteDialog(false)
          }} color="primary">
            Deletar Item
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export async function getServerSideProps(context) {
  try{
    const { 'oqueeuquero.token' : token } = parseCookies(context)
    if(!token){
      return {
        redirect: {
          destination: '/login',
          permanent: false
        }
      }
    }
    const { data : list } = await api.get('/api/list/'+context.params.ref+"?edit=true",{
      headers: { 'Authorization': `Bearer ${token}`}
    })
    if (!list) {
      return {
        notFound: true,
      }
    }

    return {
      props: { list, isPrivate: false, listRef: context.params.ref }, // will be passed to the page component as props
    }
  }catch(err){
    if(err.response.data.code === 92){
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false
        }
      }
    }
    if (err.response.data.code === 90) {
      return {
        notFound: true,
      }
    }
    if (err.response.data.code === 91) {
      return {
        props: { list: [], isPrivate: true },
      }
    }
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }
}