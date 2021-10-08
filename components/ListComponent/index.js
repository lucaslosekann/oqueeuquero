import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, Slide } from '@material-ui/core';
import { useState, forwardRef } from 'react';
import { checkItem } from '../../services/api';
import styles from './index.module.scss'
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const ListComponent = ({listObj, listRef})=>{
  return (
    <div className={styles.content}>
      <h1 className={styles.title}>{listObj.name}</h1>
      { listObj.list.map((v,i)=><EachList v={v}/>) }
    </div>
  )
}

const EachList = ({v}) => {
  const [checked, setChecked] = useState(v.checked)
  const [open, setOpen] = useState(false)
  const [dOpen, setDOpen] = useState(false);
  async function handleCheckItem(){
    setDOpen(false)
    if(checked){
      return;
    }else{
      await checkItem({
        listItemId: v.id,
        listRef
      });
      setChecked(!checked)
    }
  }
  function handleChange (){
    if(checked){
      return;
    }else{
      setDOpen(true)
    }
  }
  return (
    <div className={styles.listItem} key={v.id} id={v.id}>
      <Checkbox 
      checked={!!checked}
      disabled={!!checked}
      onChange={handleChange}/>
      <h2 className={styles.itemDescription} onClick={()=>setOpen(true)}>
        {v.description}
      </h2>
      <Modal
        open={open}
        onClose={()=>setOpen(false)}
      >
        <div className={styles.modal}>
          <h2>Opções de compra</h2>
          <ul>
            {
            v.links ? (
              v.links.map((link,i)=>{
                return (
                  <div key={link.id} id={link.id}>
                    <a href={link.link} target="_blank" rel="noreferrer">
                      <Icon icon={faCircle} className={styles.icon} />
                      <li>
                        {link.link.substr(0,60)}...
                      </li>
                    </a>
                  </div>
                )
              })
            ) : ( 
              <div>
                Nenhuma opção recomendada para este item
              </div>
            )
            }
          </ul>
        </div>
      </Modal>
      <Dialog
        open={dOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={()=>setDOpen(false)}
      >
        <DialogTitle>Você tem certeza?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Marcar um item não é uma ação que você pode desfazer
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setDOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleCheckItem} color="primary">
            Marcar item
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ListComponent;