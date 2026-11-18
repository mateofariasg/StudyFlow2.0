// Canal de Pablo Lomelí — técnicas de estudio, memorización y productividad.
const CHANNEL = 'https://www.youtube.com/pablolomeli';
const PLAYLIST = 'https://www.youtube.com/playlist?list=PLHR3PC5gXKOFKwj974H7XLZNBiRn8SoKP';

const VIDEOS = [
  { emoji: '🧠', title: 'Técnicas de estudio para dominar cualquier tema', category: 'Técnicas', url: CHANNEL },
  { emoji: '🧩', title: 'Técnicas de memorización y mnemotecnia', category: 'Memoria', url: CHANNEL },
  { emoji: '📖', title: 'Lectura veloz: lee más rápido y comprende mejor', category: 'Lectura', url: CHANNEL },
  { emoji: '🥷', title: 'Curso de técnicas de estudio (serie completa)', category: 'Curso', url: PLAYLIST },
  { emoji: '🏋️', title: 'Gimnasia cerebral y ejercicios para la memoria', category: 'Cerebro', url: CHANNEL },
  { emoji: '⚡', title: 'Hábitos y productividad para estudiar mejor', category: 'Productividad', url: CHANNEL },
];

export default function VideosView() {
  return (
    <>
      <div className="view-title">🎬 Videos Educativos</div>
      <div className="view-subtitle">
        Técnicas de estudio del canal de <strong>Pablo Lomelí</strong> — el Ninja Cerebral.
      </div>

      <a href={CHANNEL} target="_blank" rel="noopener noreferrer" className="yt-channel-banner">
        <div className="yt-channel-avatar"><i className="ri-youtube-fill" /></div>
        <div className="yt-channel-info">
          <div className="yt-channel-name">
            Pablo Lomelí <i className="ri-verified-badge-fill" style={{ color: 'var(--accent)', fontSize: '0.85rem' }} />
          </div>
          <div className="yt-channel-desc">Técnicas de estudio, memorización y aprendizaje acelerado</div>
        </div>
        <div className="yt-channel-btn"><i className="ri-external-link-line" /> Visitar canal</div>
      </a>

      <div className="videos-grid">
        {VIDEOS.map((v) => (
          <a key={v.title} href={v.url} target="_blank" rel="noopener noreferrer" className="video-card">
            <div className="video-thumb">
              <div className="video-thumb-bg">{v.emoji}</div>
              <div className="video-play-btn"><i className="ri-play-fill" /></div>
            </div>
            <div className="video-body">
              <div className="video-title">{v.title}</div>
              <div className="video-meta">
                <span
                  style={{
                    background: 'var(--accent-dim)',
                    color: 'var(--accent)',
                    padding: '1px 8px',
                    borderRadius: 20,
                    fontSize: '0.65rem',
                  }}
                >
                  {v.category}
                </span>
                &nbsp;·&nbsp; Pablo Lomelí
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
