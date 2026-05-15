interface Metricas {
    fr: number | null;
    razaoIE: number | null;
    ti: number | null;
    te: number | null;
    pressaoMedia: number | null;
}

interface Prescricao {
    fr_min: number;
    fr_max: number;
    ie_inspiracao: number;
    ie_expiracao: number;
    pressao_min: number;
    pressao_max: number;
}


interface PainelMetricasProps {
    metricas: Metricas;
    prescricao: Prescricao;
    tamanho?: "sm" | "lg";
}