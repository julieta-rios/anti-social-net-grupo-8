// Estructura de un usuario tendencia
export interface TrendingUser {
    id: number;
    nombre: string;
    interes: string;
    avatar: string;
    siguiendo: boolean;
    seguidores: number;
    likes: number;
    numeroDePosts: number;
}

interface HomeFeedProps {
    usuarios: TrendingUser[];
    onToggleSeguir: (id: number) => void;
}
export default function ({ usuarios, onToggleSeguir }: HomeFeedProps) {
    const trendingNoSeguidos = (usuarios || []).filter((u) => !u.siguiendo);
    
    return (
        <div className="card shadow-sm border-0 p-3 bg-white rounded-4 sticky-top w-100" style={{ top: '1.5rem' }}>
            <h5 className="fw-bold mb-3 text-dark fs-6 border-bottom pb-2">
                Son tendencia
            </h5>
            <div className="d-flex flex-column gap-3">
                {trendingNoSeguidos.length === 0 ? (
                    <p className="text-muted small text-center mb-0">No hay más sugerencias por ahora.</p>
                ) : (
                    trendingNoSeguidos.map((usuario) => (
                        <div className="d-flex align-items-center justify-content-between" key={usuario.id}>
                            <div className="d-flex align-items-center gap-2">
                                <img
                                    src={usuario.avatar}
                                    alt={usuario.nombre}
                                    className="rounded-circle"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                />
                                <div>
                                    <h6 className="mb-0 fs-6 fw-semibold text-dark">{usuario.nombre}</h6>
                                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                        {usuario.interes}
                                    </small>
                                </div>
                            </div>
                            <button
                                className="btn btn-sm rounded-pill px-3 py-1 btn-outline-dark"
                                style={{ fontSize: '0.8rem', minWidth: '85px' }}
                                onClick={() => onToggleSeguir(usuario.id)}
                            >
                                Seguir
                            </button>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-3 pt-2 border-top text-center">
                <a href="/" className="text-decoration-none text-muted small fw-medium">
                    Ver más sugerencias
                </a>
            </div>
        </div>
    );
}
