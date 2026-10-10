import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { GrammarItem, CEFRLevel } from '../types';

export const GrammarScreen: React.FC = () => {
  const {
    grammar,
    addGrammarItem,
    updateGrammarItem,
    deleteGrammarItem,
    speakWord,
    setIsRegisterModalOpen,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'studying' | 'mastered'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | CEFRLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GrammarItem | null>(null);

  // Form state
  const [formTopic, setFormTopic] = useState('');
  const [formLevel, setFormLevel] = useState<CEFRLevel>('A1');
  const [formExplanation, setFormExplanation] = useState('');
  const [formExEn, setFormExEn] = useState('');
  const [formExPt, setFormExPt] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const filteredGrammar = useMemo(() => {
    return grammar.filter((item) => {
      const matchesStatus =
        activeFilter === 'all' ||
        (activeFilter === 'studying' && !item.mastered) ||
        (activeFilter === 'mastered' && item.mastered);

      const matchesLevel = levelFilter === 'all' || item.level === levelFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.topic.toLowerCase().includes(query) ||
        item.ruleExplanation.toLowerCase().includes(query);

      return matchesStatus && matchesLevel && matchesSearch;
    });
  }, [grammar, activeFilter, levelFilter, searchQuery]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTopic('');
    setFormLevel('A1');
    setFormExplanation('');
    setFormExEn('');
    setFormExPt('');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: GrammarItem) => {
    setEditingItem(item);
    setFormTopic(item.topic);
    setFormLevel(item.level);
    setFormExplanation(item.ruleExplanation);
    setFormExEn(item.examples[0]?.en || '');
    setFormExPt(item.examples[0]?.pt || '');
    setFormNotes(item.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTopic.trim() || !formExplanation.trim()) return;

    const examples = formExEn.trim()
      ? [{ en: formExEn.trim(), pt: formExPt.trim() || '' }]
      : [];

    if (editingItem) {
      await updateGrammarItem(editingItem.id, {
        topic: formTopic.trim(),
        level: formLevel,
        ruleExplanation: formExplanation.trim(),
        examples,
        notes: formNotes.trim() || undefined,
      });
    } else {
      await addGrammarItem({
        topic: formTopic.trim(),
        level: formLevel,
        ruleExplanation: formExplanation.trim(),
        examples,
        notes: formNotes.trim() || undefined,
        mastered: false,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleAddStarterTopics = async () => {
    const starters: Omit<GrammarItem, 'id' | 'userId' | 'createdAt'>[] = [
      {
        topic: 'Present Simple (Afirmativa e Negativa)',
        level: 'A1',
        ruleExplanation: 'Usado para rotinas e fatos. Na 3ª pessoa do singular (he/she/it), adicione -s ou -es.',
        examples: [
          { en: 'I work every day, but he works from home.', pt: 'Eu trabalho todo dia, mas ele trabalha de casa.' },
        ],
        notes: 'Cuidado com don’t vs doesn’t.',
        mastered: false,
      },
      {
        topic: 'Verb To Be (Am, Is, Are)',
        level: 'A1',
        ruleExplanation: 'Significa "ser" ou "estar". Muda conforme o sujeito: I am, You are, He/She/It is.',
        examples: [
          { en: 'She is my English teacher.', pt: 'Ela é minha professora de inglês.' },
        ],
        notes: 'Inversão para perguntas: Is she ready?',
        mastered: true,
      },
      {
        topic: 'Preposições de Lugar: In, On, At',
        level: 'A1',
        ruleExplanation: 'In (dentro / cidades / países), On (em cima de superfícies / ruas), At (locais específicos).',
        examples: [
          { en: 'I am at the office, sitting on my chair in São Paulo.', pt: 'Estou no escritório, sentado na minha cadeira em São Paulo.' },
        ],
        notes: 'At school, at work, at home.',
        mastered: false,
      },
    ];

    for (const item of starters) {
      await addGrammarItem(item);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-12 space-y-5 px-4 pt-4">
      {/* Header */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#0284c7]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
            <span className="material-symbols-outlined text-[18px]">spellcheck</span>
          </span>
          <span className="text-[11px] font-bold text-[#38bdf8] uppercase tracking-wider">
            Estruturas & Regras
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl text-[#f1f5f9] font-bold tracking-tight">Grammar</h1>
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0284c7]/80 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-[#0284c7]/20"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Novo Tópico</span>
          </button>
        </div>
        <p className="text-xs text-[#94a3b8]">
          Cadastre tempos verbais, regras e frases modelo para consultar e fixar nos estudos.
        </p>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="space-y-2.5">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] text-[18px]">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tópico ou regra gramatical..."
            className="w-full h-10 pl-10 pr-4 bg-[#111726] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] placeholder:text-[#64748b] outline-none focus:border-[#38bdf8]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              activeFilter === 'all'
                ? 'bg-[#0284c7] text-white border-[#38bdf8]'
                : 'bg-[#111726] text-[#94a3b8] border-[#1e293b]'
            }`}
          >
            Todos ({grammar.length})
          </button>
          <button
            onClick={() => setActiveFilter('studying')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              activeFilter === 'studying'
                ? 'bg-[#0284c7] text-white border-[#38bdf8]'
                : 'bg-[#111726] text-[#94a3b8] border-[#1e293b]'
            }`}
          >
            Em Estudo ({grammar.filter((g) => !g.mastered).length})
          </button>
          <button
            onClick={() => setActiveFilter('mastered')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              activeFilter === 'mastered'
                ? 'bg-[#10b981] text-white border-[#34d399]'
                : 'bg-[#111726] text-[#94a3b8] border-[#1e293b]'
            }`}
          >
            Dominados ({grammar.filter((g) => g.mastered).length})
          </button>
        </div>
      </section>

      {/* Grammar Cards Feed */}
      <section className="space-y-3">
        {filteredGrammar.map((item) => (
          <article
            key={item.id}
            className="bg-[#111726] border border-[#1e293b] rounded-2xl p-4 shadow-xl space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#182236] border border-[#38bdf8]/30 text-[#38bdf8]">
                  Nível {item.level}
                </span>
                <h3 className="text-sm font-bold text-[#f1f5f9]">{item.topic}</h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-[#38bdf8] hover:bg-[#182236]"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
                <button
                  onClick={() => deleteGrammarItem(item.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-red-400 hover:bg-[#182236]"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>

            {/* Explanation */}
            <p className="text-xs text-[#cbd5e1] leading-relaxed bg-[#182236] p-3 rounded-xl border border-[#1e293b]">
              {item.ruleExplanation}
            </p>

            {/* Example sentence */}
            {item.examples.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#64748b]">Exemplo Prático</span>
                {item.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#0a0e17] border border-[#1e293b] flex items-center justify-between gap-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#38bdf8]">&ldquo;{ex.en}&rdquo;</span>
                      {ex.pt && <span className="text-[11px] text-[#94a3b8] italic">{ex.pt}</span>}
                    </div>
                    <button
                      onClick={() => speakWord(ex.en)}
                      className="w-8 h-8 rounded-full bg-[#182236] text-[#38bdf8] flex items-center justify-center hover:bg-[#1e293b] shrink-0"
                      title="Ouvir pronúncia"
                    >
                      <span className="material-symbols-outlined text-[16px]">volume_up</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <p className="text-[11px] text-[#94a3b8] italic">
                Nota: {item.notes}
              </p>
            )}

            {/* Footer toggle mastered */}
            <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between">
              <span className="text-[10px] text-[#64748b]">
                {item.mastered ? 'Estrutura dominada' : 'Em processo de aprendizagem'}
              </span>
              <button
                onClick={() => updateGrammarItem(item.id, { mastered: !item.mastered })}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  item.mastered
                    ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                    : 'bg-[#182236] text-[#94a3b8] border border-[#1e293b] hover:text-[#f1f5f9]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {item.mastered ? 'check_circle' : 'circle'}
                </span>
                <span>{item.mastered ? 'Dominado' : 'Marcar como Dominado'}</span>
              </button>
            </div>
          </article>
        ))}

        {/* Empty state when zeroed */}
        {filteredGrammar.length === 0 && (
          <div className="bg-[#111726] border border-[#1e293b] rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#182236] text-[#38bdf8] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">menu_book</span>
            </div>
            <h3 className="text-sm font-bold text-[#f1f5f9]">Nenhum tópico de gramática cadastrado ainda</h3>
            <p className="text-xs text-[#94a3b8] max-w-xs mx-auto">
              Como o app está limpo, você pode adicionar suas próprias anotações de regras ou carregar exemplos essenciais do nível A1.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                onClick={handleOpenAdd}
                className="w-full sm:w-auto px-4 py-2 bg-[#0284c7] text-white rounded-xl text-xs font-semibold shadow-md"
              >
                + Adicionar Minha Primeira Regra
              </button>
              <button
                onClick={handleAddStarterTopics}
                className="w-full sm:w-auto px-4 py-2 bg-[#182236] text-[#38bdf8] border border-[#38bdf8]/30 rounded-xl text-xs font-semibold hover:bg-[#1e293b]"
              >
                Carregar Tópicos A1 Essenciais
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Add / Edit Grammar Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#000000]/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#111726] border border-[#1e293b] rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h3 className="text-sm font-bold text-[#f1f5f9]">
                {editingItem ? 'Editar Tópico Gramatical' : 'Adicionar Tópico Gramatical'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                  Nome do Tópico / Regra *
                </label>
                <input
                  type="text"
                  required
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="Ex: Simple Present (Regras e 3ª Pessoa)"
                  className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                  Nível CEFR
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormLevel(lvl)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        formLevel === lvl
                          ? 'bg-[#0284c7] text-white border-[#38bdf8]'
                          : 'bg-[#182236] text-[#94a3b8] border-[#1e293b]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                  Explicação da Regra / Como Funciona *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Explique com suas palavras a regra, quando usar e exceções..."
                  className="w-full p-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] outline-none focus:border-[#38bdf8] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                  Frase de Exemplo (Inglês)
                </label>
                <input
                  type="text"
                  value={formExEn}
                  onChange={(e) => setFormExEn(e.target.value)}
                  placeholder="Ex: He plays guitar every evening."
                  className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                  Tradução do Exemplo (Português)
                </label>
                <input
                  type="text"
                  value={formExPt}
                  onChange={(e) => setFormExPt(e.target.value)}
                  placeholder="Ex: Ele toca violão toda noite."
                  className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                  Dicas e Anotações Pessoais
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Não esquecer de usar does em perguntas."
                  className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94a3b8] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0284c7] hover:bg-[#0284c7]/90 text-white rounded-xl text-xs font-semibold shadow-md shadow-[#0284c7]/20"
                >
                  Salvar Tópico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
