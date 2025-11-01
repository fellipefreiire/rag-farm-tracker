import { useState } from "react";

export function Test({
    disabled = false
}) {
    const [search, setSearch] = useState('');

    return (
        <div className="bg-white flex justify-between gap-[20px]">
            <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Selecionar Mobs</h2>
                <input
                    type="text"
                    placeholder="Buscar mob por nome ou ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={disabled}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
            </div>
            <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Mobs Selecionados</h2>
            </div>
        </div>
    )
}