import "../../../styles/fisioterapeuta/modalposSessao.css"
import { CgClose } from "react-icons/cg";

type Props = {
    onFechar: () => void;
}

function ModalPosSessao({ onFechar }: Props) {
    return (
        <div className="modal-overlay" onClick={onFechar}>
            <div className="modal sm" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Sessão encerrada com sucesso!</h2>
                    <span onClick={onFechar}>
                        <CgClose />
                    </span>
                </div>

                <div className="modal-body">
                    <h3>Os dados da sessão foram armazenados e processados.</h3>
                    <p>Selecione uma opção para continuar:</p>

                    <div className="botoes">
                        <button className="btn btn-primary-white">Ver relatório</button>
                        <button className="btn btn-primary-white">Análise preditiva</button>
                        <button className="btn btn-secondary-white">Histórico de sessões</button>
                        <button className="btn btn-secondary-white" onClick={onFechar}>Voltar ao início</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalPosSessao;