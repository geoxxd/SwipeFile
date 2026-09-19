import React, { useState } from 'react';
import {
  FolderArchive,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Layers,
  ArrowRight,
  Check,
  X,
  Sparkles,
  FolderPlus
} from 'lucide-react';
import { Collection, Offer } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from '../components/Toast.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { CreativeMediaPreview } from '../components/CreativeMediaPreview.tsx';
import { ConfirmModal } from '../components/ConfirmModal.tsx';

interface CollectionsViewProps {
  collections: Collection[];
  offers: Offer[];
  isOwner: boolean;
  onSelectOffer: (offerId: string) => void;
  onRefreshData: () => void;
}

export function CollectionsView({
  collections,
  offers,
  isOwner,
  onSelectOffer,
  onRefreshData
}: CollectionsViewProps) {
  const { success, error } = useToast();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(
    collections[0]?.id || null
  );

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageOffersModal, setShowManageOffersModal] = useState(false);
  const [deletingCollectionId, setDeletingCollectionId] = useState<string | null>(null);

  const activeCollection = collections.find((c) => c.id === selectedCollectionId);
  const collectionOffers = offers.filter((o) =>
    activeCollection?.offerIds?.includes(o.id)
  );

  const handleDeleteCollection = async () => {
    if (!deletingCollectionId) return;
    try {
      await api.deleteCollection(deletingCollectionId);
      success('Coleção removida com sucesso.');
      setDeletingCollectionId(null);
      onRefreshData();
      if (selectedCollectionId === deletingCollectionId) {
        setSelectedCollectionId(collections[0]?.id || null);
      }
    } catch (err: any) {
      error(err.message || 'Falha ao excluir coleção.');
    }
  };

  const handleToggleOfferInCollection = async (offerId: string) => {
    if (!activeCollection || !isOwner) return;
    const exists = activeCollection.offerIds.includes(offerId);
    try {
      if (exists) {
        await api.removeOfferFromCollection(activeCollection.id, offerId);
      } else {
        await api.addOfferToCollection(activeCollection.id, offerId);
      }
      onRefreshData();
    } catch (err: any) {
      error(err.message || 'Erro ao atualizar coleção.');
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Coleções & Pastas</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1F2A1F] text-[#22C55E] font-mono-num font-semibold">
              {collections.length}
            </span>
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Organize suas ofertas por projetos, sprints, nichos específicos ou prioridades.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#4ADE80] text-black font-semibold text-xs transition-all shadow-lg shadow-emerald-950/40 green-glow-sm"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Nova Coleção</span>
          </button>
        )}
      </div>

      {collections.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#111411] border border-[#1F2A1F] text-center flex flex-col items-center justify-center gap-3">
          <FolderArchive className="w-10 h-10 text-[#22C55E]" />
          <h3 className="text-base font-bold text-white">Nenhuma coleção criada</h3>
          <p className="text-xs text-[#9CA3AF] max-w-sm">
            Crie pastas para agrupar ofertas de saúde, finanças, low ticket ou estratégias de teste.
          </p>
          {isOwner && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-[#22C55E] text-black font-bold text-xs"
            >
              Criar Primeira Coleção
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Collections Sidebar List */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1 px-1">
              Suas Coleções
            </span>
            {collections.map((col) => {
              const isSelected = col.id === selectedCollectionId;
              const count = col.offerIds?.length || 0;
              return (
                <div
                  key={col.id}
                  onClick={() => setSelectedCollectionId(col.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-[#182018] border-[#22C55E]/40 text-white shadow-lg shadow-emerald-950/20'
                      : 'bg-[#111411] border-[#1F2A1F] text-[#9CA3AF] hover:text-white hover:bg-[#161B16]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: col.color || '#22C55E' }}
                    />
                    <div className="truncate">
                      <h4 className="text-sm font-bold truncate group-hover:text-[#22C55E] transition-colors">
                        {col.name}
                      </h4>
                      {col.description && (
                        <p className="text-[11px] text-[#6B7280] truncate">{col.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-num font-semibold bg-[#0A0D0A] text-[#22C55E] border border-[#1F2A1F]">
                      {count}
                    </span>
                    {isOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingCollectionId(col.id);
                        }}
                        className="p-1 text-[#6B7280] hover:text-[#EF4444] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Excluir Coleção"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Active Collection Content */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {activeCollection ? (
              <div className="p-6 rounded-2xl bg-[#111411] border border-[#1F2A1F] flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1F2A1F]">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: activeCollection.color || '#22C55E' }}
                    />
                    <div>
                      <h2 className="text-lg font-bold text-white">{activeCollection.name}</h2>
                      <p className="text-xs text-[#9CA3AF]">
                        {activeCollection.description || 'Sem descrição cadastrada.'}
                      </p>
                    </div>
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => setShowManageOffersModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A221A] hover:bg-[#232F23] text-[#22C55E] border border-[#22C55E]/30 text-xs font-medium self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Gerenciar Ofertas da Coleção</span>
                    </button>
                  )}
                </div>

                {/* Offers inside this collection */}
                {collectionOffers.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-[#1F2A1F] text-center text-xs text-[#6B7280]">
                    Esta coleção ainda não possui nenhuma oferta vinculada.
                    {isOwner && (
                      <div className="mt-2">
                        <button
                          onClick={() => setShowManageOffersModal(true)}
                          className="text-[#22C55E] hover:underline font-semibold"
                        >
                          Adicionar ofertas agora
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {collectionOffers.map((offer) => {
                      return (
                        <div
                          key={offer.id}
                          onClick={() => onSelectOffer(offer.id)}
                          className="cursor-pointer p-4 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] hover:border-[#22C55E]/40 transition-all hover:translate-y-[-2px] flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-[#111411] border border-[#1F2A1F] overflow-hidden shrink-0 flex items-center justify-center">
                              <CreativeMediaPreview creative={offer.creatives?.[0]} showPlayBadge={false} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] text-[#22C55E] block font-medium">
                                {offer.niche}
                              </span>
                              <h4 className="text-xs font-bold text-white group-hover:text-[#22C55E] transition-colors truncate">
                                {offer.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={offer.status} size="sm" />
                                <span className="text-[10px] text-[#6B7280] font-mono-num">
                                  {offer.activeAdsCurrent || 0} ads
                                </span>
                              </div>
                            </div>
                          </div>

                          <ArrowRight className="w-4 h-4 text-[#4B5563] group-hover:text-[#22C55E] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#111411] border border-[#1F2A1F] text-center text-xs text-[#6B7280]">
                Selecione uma coleção ao lado para visualizar as ofertas.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE COLLECTION MODAL */}
      {showCreateModal && (
        <CreateCollectionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newCol) => {
            setShowCreateModal(false);
            onRefreshData();
            setSelectedCollectionId(newCol.id);
          }}
        />
      )}

      {/* MANAGE OFFERS MODAL */}
      {showManageOffersModal && activeCollection && (
        <ManageCollectionOffersModal
          collection={activeCollection}
          offers={offers}
          onClose={() => setShowManageOffersModal(false)}
          onToggleOffer={handleToggleOfferInCollection}
        />
      )}

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!deletingCollectionId}
        title="Excluir Coleção?"
        message="Deseja excluir esta coleção? As ofertas vinculadas continuarão salvas no seu swipe file normalmente."
        confirmLabel="Excluir Coleção"
        onConfirm={handleDeleteCollection}
        onCancel={() => setDeletingCollectionId(null)}
      />
    </div>
  );
}

function CreateCollectionModal({
  onClose,
  onCreated
}: {
  onClose: () => void;
  onCreated: (col: Collection) => void;
}) {
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#22C55E');
  const [loading, setLoading] = useState(false);

  const colorOptions = [
    '#22C55E', // Green
    '#3B82F6', // Blue
    '#A855F7', // Purple
    '#EAB308', // Yellow
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316' // Orange
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const col = await api.createCollection({
        name: name.trim(),
        description: description.trim() || undefined,
        color
      });
      success('Coleção criada com sucesso!');
      onCreated(col);
    } catch (err: any) {
      error(err.message || 'Falha ao criar coleção.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111411] border border-[#1F2A1F] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-base font-bold text-white mb-4">Criar Nova Coleção</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">Nome da Coleção *</label>
            <input
              type="text"
              required
              placeholder="Ex.: Projetos de Saúde Q4"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-sm text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1">Descrição</label>
            <input
              type="text"
              placeholder="Ex.: Ofertas de dores articulares e suplementos"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#0A0D0A] border border-[#1F2A1F] text-xs text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#D1D5DB] font-semibold mb-1.5">Cor da Pasta</label>
            <div className="flex items-center gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-[#1F2A1F]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#9CA3AF] hover:text-white bg-[#1A221A] rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-black bg-[#22C55E] hover:bg-[#4ADE80] rounded-xl"
            >
              {loading ? 'Criando...' : 'Criar Pasta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManageCollectionOffersModal({
  collection,
  offers,
  onClose,
  onToggleOffer
}: {
  collection: Collection;
  offers: Offer[];
  onClose: () => void;
  onToggleOffer: (offerId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#111411] border border-[#1F2A1F] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h3 className="text-base font-bold text-white">Vincular Ofertas: {collection.name}</h3>
          <p className="text-xs text-[#9CA3AF]">
            Marque as ofertas que deseja incluir nesta coleção.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
          {offers.map((offer) => {
            const isIncluded = collection.offerIds?.includes(offer.id);
            return (
              <div
                key={offer.id}
                onClick={() => onToggleOffer(offer.id)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  isIncluded
                    ? 'bg-[#182018] border-[#22C55E]/40 text-white'
                    : 'bg-[#0A0D0A] border-[#1F2A1F] text-[#9CA3AF] hover:text-white'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-bold truncate">{offer.name}</h4>
                  <span className="text-[10px] text-[#6B7280]">{offer.niche}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    isIncluded
                      ? 'bg-[#22C55E] border-[#22C55E] text-black'
                      : 'border-[#374151]'
                  }`}
                >
                  {isIncluded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-[#1F2A1F] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-black bg-[#22C55E] hover:bg-[#4ADE80] rounded-xl"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
