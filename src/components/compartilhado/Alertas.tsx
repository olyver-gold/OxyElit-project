import { LuTriangleAlert } from "react-icons/lu";
import "../../styles/components/alerta.css";

interface AlertaProps {
    mensagem: string;
    onRegistrarAjuste: () => void;
    resolvido: boolean;
}

function Alerta({ mensagem, onRegistrarAjuste, resolvido }: AlertaProps) {
    if (!resolvido) return null;

    return (
        <div className="card-alerta">
            <div>
                <div className="alerta-header">
                    <LuTriangleAlert className="alert"/>
                    <span>Alerta ativo</span>
                </div>
                <p>{mensagem}</p>
            </div>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={onRegistrarAjuste}>
                Registrar ajuste
            </button>
        </div>
    );
}

export default Alerta;