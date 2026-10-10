import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VocabularyStatus } from '../types';

export const AddVocabularyModal: React.FC = () => {
  const {
    isAddVocabModalOpen,
    setIsAddVocabModalOpen,
    selectedVocabForEdit,
    setSelectedVocabForEdit,
    addVocabulary,
    updateVocabulary,
    deleteVocabulary,
  } = useApp();

  const [word, setWord] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [category, setCategory] = useState('Conjunction');
  const [translation, setTranslation] = useState('');
  const [exampleEn, setExampleEn] = useState('');
  const [examplePt, setExamplePt] = useState('');
  const [contextSource, setContextSource] = useState('Via Prática');
  const [status, setStatus] = useState<VocabularyStatus>('review');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedVocabForEdit) {
      setWord(selectedVocabForEdit.word);
      setPhonetic(selectedVocabForEdit.phonetic || '');
      setCategory(selectedVocabForEdit.category || 'Conjunction');
      setTranslation(selectedVocabForEdit.translation);
      setExampleEn(selectedVocabForEdit.exampleEn || '');
      setExamplePt(selectedVocabForEdit.examplePt || '');
      setContextSource(selectedVocabForEdit.contextSource || 'Via Prática');
      setStatus(selectedVocabForEdit.status);
    } else {
      setWord('');
      setPhonetic('');
      setCategory('Noun');
      setTranslation('');
      setExampleEn('');
      setExamplePt('');
      setContextSource('Via Prática');
      setStatus('review');
    }
  }, [selectedVocabForEdit, isAddVocabModalOpen]);

  if (!isAddVocabModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !translation.trim()) return;

    setIsSubmitting(true);
    try {
      if (selectedVocabForEdit) {
        await updateVocabulary(selectedVocabForEdit.id, {
          word: word.trim(),
          phonetic: phonetic.trim() || undefined,
          category: category.trim() || undefined,
          translation: translation.trim(),
          exampleEn: exampleEn.trim() || undefined,
          examplePt: examplePt.trim() || undefined,
          contextSource: contextSource.trim() || undefined,
          status,
        });
      } else {
        await addVocabulary({
          word: word.trim(),
          phonetic: phonetic.trim() || undefined,
          category: category.trim() || undefined,
          translation: translation.trim(),
          exampleEn: exampleEn.trim() || undefined,
          examplePt: examplePt.trim() || undefined,
          contextSource: contextSource.trim() || undefined,
          status,
        });
      }
      setIsAddVocabModalOpen(false);
      setSelectedVocabForEdit(null);
    } catch (err) {
      console.error('Error saving vocabulary:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (selectedVocabForEdit && confirm('Deseja excluir esta palavra do caderno?')) {
      await deleteVocabulary(selectedVocabForEdit.id);
      setIsAddVocabModalOpen(false);
      setSelectedVocabForEdit(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#000000]/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={() => {
        setIsAddVocabModalOpen(false);
        setSelectedVocabForEdit(null);
      }}
    >
      <div
        className="w-full max-w-md bg-[#111726] border border-[#1e293b] rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#0284c7]/20 border border-[#38bdf8]/30 text-[#38bdf8] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
            </span>
            <h3 className="font-serif text-lg font-bold text-[#f1f5f9]">
              {selectedVocabForEdit ? 'Editar Vocabulário' : 'Adicionar Nova Palavra'}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsAddVocabModalOpen(false);
              setSelectedVocabForEdit(null);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Word and Phonetic */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                Termo em Inglês *
              </label>
              <input
                type="text"
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Ex: Although"
                className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                Pronúncia (IPA)
              </label>
              <input
                type="text"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                placeholder="Ex: /ɔːlˈðəʊ/"
                className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Classe Gramatical</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] outline-none focus:border-[#38bdf8]"
              >
                <option value="Conjunction">Conjunction</option>
                <option value="Phrasal Verb">Phrasal Verb</option>
                <option value="Noun">Noun</option>
                <option value="Verb">Verb</option>
                <option value="Adjective">Adjective</option>
                <option value="Adverb">Adverb</option>
                <option value="Preposition">Preposition</option>
                <option value="Idiom">Expressão / Idiom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VocabularyStatus)}
                className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] outline-none focus:border-[#38bdf8]"
              >
                <option value="review">Para revisar</option>
                <option value="learning">Em aprendizado</option>
                <option value="learned">Aprendida</option>
              </select>
            </div>
          </div>

          {/* Translation */}
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
              Significado em Português *
            </label>
            <input
              type="text"
              required
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="Ex: Embora / Apesar de que"
              className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] outline-none focus:border-[#38bdf8]"
            />
          </div>

          {/* Example in EN */}
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
              Exemplo de Uso (Inglês)
            </label>
            <input
              type="text"
              value={exampleEn}
              onChange={(e) => setExampleEn(e.target.value)}
              placeholder="Ex: Although it was raining, we went outside."
              className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] outline-none focus:border-[#38bdf8]"
            />
          </div>

          {/* Example in PT */}
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
              Tradução do Exemplo
            </label>
            <input
              type="text"
              value={examplePt}
              onChange={(e) => setExamplePt(e.target.value)}
              placeholder="Ex: Embora estivesse chovendo, saímos para fora."
              className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] outline-none focus:border-[#38bdf8]"
            />
          </div>

          {/* Context source */}
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] mb-1">Origem / Contexto</label>
            <input
              type="text"
              value={contextSource}
              onChange={(e) => setContextSource(e.target.value)}
              placeholder="Ex: Podcast / Artigo / Série"
              className="w-full h-10 px-3 bg-[#182236] border border-[#1e293b] rounded-xl text-xs text-[#f1f5f9] outline-none focus:border-[#38bdf8]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#1e293b]">
            {selectedVocabForEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs text-red-400 hover:underline font-semibold"
              >
                Excluir termo
              </button>
            ) : <span />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddVocabModalOpen(false);
                  setSelectedVocabForEdit(null);
                }}
                className="h-10 px-4 rounded-xl bg-[#182236] text-[#94a3b8] text-xs font-semibold hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-5 rounded-xl bg-[#0284c7] hover:bg-[#0284c7]/90 text-white text-xs font-semibold shadow-md shadow-[#0284c7]/20 disabled:opacity-50"
              >
                {selectedVocabForEdit ? 'Atualizar Palavra' : 'Salvar no Caderno'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
