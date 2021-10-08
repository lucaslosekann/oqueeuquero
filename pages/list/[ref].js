import { useRouter } from 'next/router'
import { api } from './../../services/api';
import ListComponent from './../../components/ListComponent';
import PrivateListComponent from './../../components/PrivateListComponent'
import styles from '../../styles/list.module.scss'
export default function List({ list : listObj, isPrivate, listRef }) {
  return (
    <div className={styles.container}>
      {
        isPrivate ? (
          <PrivateListComponent />
        ) : (
          <ListComponent listObj={listObj} listRef={listRef}/>
        )
      }
    </div>
  )
}








export async function getServerSideProps(context) {
  try{
    const { data : list } = await api.get('/api/list/'+context.params.ref)
    if (!list) {
      return {
        notFound: true,
      }
    }
    return {
      props: { list, isPrivate: false, listRef: context.params.ref }, // will be passed to the page component as props
    }
  }catch(err){
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
      props: { list: {
        list:[]
      } }, // will be passed to the page component as props
    }
  }

}