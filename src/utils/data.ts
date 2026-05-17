export function formatarDataHoraSQLite(dataSQLite: string | null): string {
    if (!dataSQLite) return "Nenhuma";

    const dataUTC = new Date(dataSQLite.replace(" ", "T") + "Z");

    return dataUTC.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatarDataSQLite(dataSQLite: string | null): string {
    if (!dataSQLite) return "Nenhuma";

    const dataUTC = new Date(dataSQLite.replace(" ", "T") + "Z");

    return dataUTC.toLocaleDateString("pt-BR");
}

export function calcularDuracaoSessao(inicioSQLite: string | null | undefined): string {
    if (!inicioSQLite) return "0min 00s";

    const inicio = new Date(inicioSQLite.replace(" ", "T") + "Z");
    const agora = new Date();

    const diferencaMs = agora.getTime() - inicio.getTime();
    const totalSegundos = Math.max(0, Math.floor(diferencaMs / 1000));

    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    if (horas > 0) {
        return `${horas}h ${minutos.toString().padStart(2, "0")}min ${segundos
        .toString()
        .padStart(2, "0")}s`;
    }

    return `${minutos}min ${segundos.toString().padStart(2, "0")}s`;
}