import { Circle } from "@mui/icons-material";
import { CircleLoader, ClipLoader, DotLoader, RingLoader } from "react-spinners";

function Loading() {
  return (
    <center style={{display: 'flex', placeItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'whitesmoke'}}>
      <div >
        <img src = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" 
        alt="Loading..." style={{ width: '200px', height: '200px' , marginBottom : '10px' }} />
         <RingLoader size={70} color="#3CBC28" /> 
      </div>
    </center>
  )
}

export default Loading
