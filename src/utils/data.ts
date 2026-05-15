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