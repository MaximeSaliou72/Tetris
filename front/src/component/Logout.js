import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();
    useEffect(() => {
        logout();
    }, []);

    const logout = () => {
      localStorage.clear();
      navigate('/')
    }   
}
export default Logout