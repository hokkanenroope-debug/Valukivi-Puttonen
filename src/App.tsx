import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Group, Path, Star } from 'react-konva';
import useImage from 'use-image';
import { 
  Plus, 
  Trash2, 
  Type, 
  Move, 
  Layers, 
  Maximize2, 
  Flame,
  Download,
  ChevronDown,
  Settings2
} from 'lucide-react';
import { WIDTH_OPTIONS, HEIGHT_OPTIONS, FIRST_NAME_SIZES, LAST_NAME_SIZES, DATE_SIZES, TombstoneSize, Engraving, FONT_FAMILIES, EngravingType, STONE_COLORS, LETTERING_COLORS, EngravingCategory } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [selectedSize, setSelectedSize] = useState<TombstoneSize>({ width: 60, height: 80, label: "60x80 cm" });
  const [stoneColor, setStoneColor] = useState(STONE_COLORS[0].value);
  const [letteringColor, setLetteringColor] = useState(LETTERING_COLORS[0].value);
  const [engravings, setEngravings] = useState<Engraving[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(4); // Pixels per cm
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [firstNameSize, setFirstNameSize] = useState(40); // Default 40mm
  const [lastNameSize, setLastNameSize] = useState(50); // Default 50mm
  const [birthDateSize, setBirthDateSize] = useState(25); // Default 25mm
  const [deathDateSize, setDeathDateSize] = useState(25); // Default 25mm
  const [birthDateInput, setBirthDateInput] = useState("");
  const [deathDateInput, setDeathDateInput] = useState("");
  const [blackTexture] = useImage('/stone-black.jpg');
  const [greyTexture] = useImage('/stone-grey.jpg');
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  // Handle selection
  const handleSelect = (id: string | null) => {
    setSelectedId(id);
  };

  const handleBirthDateChange = (value: string) => {
    const isDeleting = value.length < birthDateInput.length;
    let digits = value.replace(/\D/g, "").slice(0, 8);
    
    if (isDeleting && birthDateInput.length > 0) {
      const lastChar = birthDateInput[birthDateInput.length - 1];
      if (lastChar === '.' || lastChar === ' ') {
        if (!value.endsWith(lastChar)) {
          digits = digits.slice(0, -1);
        }
      }
    }

    let formatted = "";
    if (digits.length > 0) {
      formatted += digits.substring(0, 2);
      if (digits.length >= 2) formatted += ".";
      if (digits.length > 2) {
        formatted += digits.substring(2, 4);
        if (digits.length >= 4) formatted += ".";
      }
      if (digits.length > 4) {
        formatted += digits.substring(4, 8);
      }
    }
    setBirthDateInput(formatted);
  };

  const handleDeathDateChange = (value: string) => {
    const isDeleting = value.length < deathDateInput.length;
    let digits = value.replace(/\D/g, "").slice(0, 8);
    
    if (isDeleting && deathDateInput.length > 0) {
      const lastChar = deathDateInput[deathDateInput.length - 1];
      if (lastChar === '.' || lastChar === ' ') {
        if (!value.endsWith(lastChar)) {
          digits = digits.slice(0, -1);
        }
      }
    }

    let formatted = "";
    if (digits.length > 0) {
      formatted += digits.substring(0, 2);
      if (digits.length >= 2) formatted += ".";
      if (digits.length > 2) {
        formatted += digits.substring(2, 4);
        if (digits.length >= 4) formatted += ".";
      }
      if (digits.length > 4) {
        formatted += digits.substring(4, 8);
      }
    }
    setDeathDateInput(formatted);
  };

  const addBirthDateEngraving = () => {
    if (birthDateInput.trim()) {
      addEngraving('text', birthDateInput, birthDateSize / 10, 'birthDate');
      setBirthDateInput("");
    }
  };

  const addDeathDateEngraving = () => {
    if (deathDateInput.trim()) {
      addEngraving('text', deathDateInput, deathDateSize / 10, 'deathDate');
      setDeathDateInput("");
    }
  };

  const addEngraving = (type: EngravingType = 'text', customText?: string, customFontSize?: number, category: EngravingCategory = 'other') => {
    const newEngraving: Engraving = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      category,
      text: customText || (type === 'symbol' ? '✠' : type === 'cutout' ? 'Kynttiläholvi' : type === 'cross' ? 'Risti' : "UUSI KAIVERRUS"),
      x: selectedSize.width / 2,
      y: selectedSize.height / 2,
      width: type === 'cutout' ? 12 : type === 'cross' ? 5 : undefined,
      height: type === 'cutout' ? 24 : type === 'cross' ? 15 : undefined,
      fontSize: customFontSize || (type === 'symbol' ? 5 : 4),
      fontFamily: type === 'symbol' ? "Inter" : "Cormorant Garamond",
      fontStyle: type === 'symbol' ? "bold" : "normal",
      color: type === 'cutout' ? "#0a0a0a" : letteringColor,
      stroke: "#000000",
      strokeWidth: 0,
      letterSpacing: 1,
      isDragging: false,
    };
    setEngravings([...engravings, newEngraving]);
    setSelectedId(newEngraving.id);
  };

  const updateEngraving = (id: string, updates: Partial<Engraving>) => {
    setEngravings(engravings.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEngraving = (id: string) => {
    setEngravings(engravings.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectedEngraving = engravings.find(e => e.id === selectedId);

  // Update scale based on container size
  useEffect(() => {
    const updateScale = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        const padding = 80;
        const availableWidth = container.clientWidth - padding;
        const availableHeight = container.clientHeight - padding;
        const scaleW = availableWidth / selectedSize.width;
        const scaleH = availableHeight / selectedSize.height;
        setScale(Math.min(scaleW, scaleH));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [selectedSize]);

  // Update all engravings when global lettering color changes
  useEffect(() => {
    setEngravings(prev => prev.map(eng => 
      eng.type !== 'cutout' ? { ...eng, color: letteringColor } : eng
    ));
  }, [letteringColor]);

  const handleExport = () => {
    if (stageRef.current) {
      const uri = stageRef.current.toDataURL();
      const link = document.createElement('a');
      link.download = `tombstone-${selectedSize.label}.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-zinc-300 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-80 bg-[#151515] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-serif italic text-white tracking-tight">Valukivi Puttonen Design</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1">Stone Designer v1.0</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Size Selection */}
          <section className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold flex items-center gap-2">
              <Maximize2 size={12} />
              Kiven koko
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-600 uppercase font-bold px-1">Leveys (cm)</label>
                <div className="relative">
                  <select 
                    value={selectedSize.width}
                    onChange={(e) => {
                      const width = Number(e.target.value);
                      setSelectedSize(prev => ({ ...prev, width, label: `${width}x${prev.height} cm` }));
                    }}
                    className="w-full bg-[#222222] border border-white/10 rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:border-zinc-400 transition-colors text-sm"
                  >
                    {WIDTH_OPTIONS.map(w => (
                      <option key={w} value={w}>{w} cm</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" size={14} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-600 uppercase font-bold px-1">Korkeus (cm)</label>
                <div className="relative">
                  <select 
                    value={selectedSize.height}
                    onChange={(e) => {
                      const height = Number(e.target.value);
                      setSelectedSize(prev => ({ ...prev, height, label: `${prev.width}x${height} cm` }));
                    }}
                    className="w-full bg-[#222222] border border-white/10 rounded-lg px-3 py-2.5 appearance-none focus:outline-none focus:border-zinc-400 transition-colors text-sm"
                  >
                    {HEIGHT_OPTIONS.map(h => (
                      <option key={h} value={h}>{h} cm</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" size={14} />
                </div>
              </div>
            </div>
          </section>

          {/* Stone Color Selection */}
          <section className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-400" />
              Kiven väri
            </label>
            <div className="grid grid-cols-2 gap-3">
              {STONE_COLORS.map(color => (
                <button
                  key={color.value}
                  onClick={() => setStoneColor(color.value)}
                  className={cn(
                    "w-full bg-[#222222] border border-white/10 rounded-lg px-3 py-2 text-sm transition-all text-center",
                    stoneColor === color.value 
                      ? "border-zinc-400 text-white bg-zinc-800" 
                      : "text-zinc-400 hover:border-zinc-600"
                  )}
                >
                  {color.label}
                </button>
              ))}
            </div>
          </section>

          {/* Engravings List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold flex items-center gap-2">
                <Layers size={12} />
                Elements
              </label>
            </div>

            <div className="space-y-3">
              {/* Lettering Color Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-600 uppercase font-bold px-1">Kirjaimien väri</label>
                <div className="grid grid-cols-2 gap-3">
                  {LETTERING_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setLetteringColor(color.value)}
                      className={cn(
                        "w-full bg-[#222222] border border-white/10 rounded-lg px-3 py-2 text-sm transition-all text-center",
                        letteringColor === color.value 
                          ? "border-zinc-400 text-white bg-zinc-800" 
                          : "text-zinc-400 hover:border-zinc-600"
                      )}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] text-zinc-600 uppercase font-bold">Etunimi</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Kirjainkoko</span>
                    <select 
                      value={firstNameSize}
                      onChange={(e) => setFirstNameSize(Number(e.target.value))}
                      className="bg-transparent text-[10px] text-zinc-400 font-bold focus:outline-none"
                    >
                      {FIRST_NAME_SIZES.map(size => (
                        <option key={size} value={size}>{size}mm</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    value={firstNameInput}
                    onChange={(e) => setFirstNameInput(e.target.value.toUpperCase())}
                    placeholder="MATTI"
                    className="w-full bg-[#222222] border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-zinc-400 transition-colors"
                  />
                  <button 
                    onClick={() => {
                      if (firstNameInput.trim()) {
                        addEngraving('text', firstNameInput, firstNameSize / 10, 'firstName');
                        setFirstNameInput("");
                      }
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] text-zinc-600 uppercase font-bold">Sukunimi</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Kirjainkoko</span>
                    <select 
                      value={lastNameSize}
                      onChange={(e) => setLastNameSize(Number(e.target.value))}
                      className="bg-transparent text-[10px] text-zinc-400 font-bold focus:outline-none"
                    >
                      {LAST_NAME_SIZES.map(size => (
                        <option key={size} value={size}>{size}mm</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    value={lastNameInput}
                    onChange={(e) => setLastNameInput(e.target.value.toUpperCase())}
                    placeholder="MEIKÄLÄINEN"
                    className="w-full bg-[#222222] border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-zinc-400 transition-colors"
                  />
                  <button 
                    onClick={() => {
                      if (lastNameInput.trim()) {
                        addEngraving('text', lastNameInput, lastNameSize / 10, 'lastName');
                        setLastNameInput("");
                      }
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] text-zinc-600 uppercase font-bold">Syntymäpäivä</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Kirjainkoko</span>
                    <select 
                      value={birthDateSize}
                      onChange={(e) => setBirthDateSize(Number(e.target.value))}
                      className="bg-transparent text-[10px] text-zinc-400 font-bold focus:outline-none"
                    >
                      {DATE_SIZES.map(size => (
                        <option key={size} value={size}>{size}mm</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    value={birthDateInput}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                    placeholder="01.01.1950"
                    className="w-full bg-[#222222] border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-zinc-400 transition-colors tracking-wider font-mono"
                  />
                  <button 
                    onClick={addBirthDateEngraving}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] text-zinc-600 uppercase font-bold">Kuolinpäivä</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Kirjainkoko</span>
                    <select 
                      value={deathDateSize}
                      onChange={(e) => setDeathDateSize(Number(e.target.value))}
                      className="bg-transparent text-[10px] text-zinc-400 font-bold focus:outline-none"
                    >
                      {DATE_SIZES.map(size => (
                        <option key={size} value={size}>{size}mm</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    value={deathDateInput}
                    onChange={(e) => handleDeathDateChange(e.target.value)}
                    placeholder="01.01.2024"
                    className="w-full bg-[#222222] border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-zinc-400 transition-colors tracking-wider font-mono"
                  />
                  <button 
                    onClick={addDeathDateEngraving}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => addEngraving('cutout')}
                className="w-full bg-[#222222] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-zinc-400 transition-all text-sm group"
              >
                <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                  <Flame size={16} />
                </div>
                <span className="text-zinc-400 group-hover:text-white transition-colors">Kynttiläholvi (12x24cm)</span>
              </button>

              <button 
                onClick={() => addEngraving('cross')}
                className="w-full bg-[#222222] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-zinc-400 transition-all text-sm group"
              >
                <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                  <Plus size={16} />
                </div>
                <span className="text-zinc-400 group-hover:text-white transition-colors">Risti (5x15cm)</span>
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {engravings.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">
                  <p className="text-xs text-zinc-600 italic">No elements added yet</p>
                </div>
              ) : (
                engravings.map(eng => (
                  <div 
                    key={eng.id}
                    onClick={() => handleSelect(eng.id)}
                    className={cn(
                      "group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                      selectedId === eng.id 
                        ? "bg-zinc-800/50 border-zinc-500 text-white" 
                        : "bg-[#222222] border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {eng.type === 'symbol' ? <Plus size={14} className="text-zinc-400" /> : eng.type === 'cutout' ? <Flame size={14} className="text-zinc-400" /> : <Type size={14} className={selectedId === eng.id ? "text-zinc-300" : "text-zinc-600"} />}
                      <span className="text-xs truncate font-medium">{eng.type === 'symbol' ? "Cross" : eng.type === 'cutout' ? "Kynttiläholvi" : (eng.text || "Empty text")}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEngraving(eng.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Properties Panel */}
          {selectedEngraving && (
            <section className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold flex items-center gap-2">
                <Settings2 size={12} />
                Properties
              </label>
              
              <div className="space-y-4">
                {(selectedEngraving.type === 'text' || selectedEngraving.type === 'symbol') && (
                  <>
                    {selectedEngraving.type === 'text' && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-600 uppercase font-bold">Content</span>
                        <textarea 
                          value={selectedEngraving.text}
                          onChange={(e) => updateEngraving(selectedEngraving.id, { text: e.target.value.toUpperCase() })}
                          className="w-full bg-[#222222] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400 min-h-[80px] resize-none"
                          placeholder="Enter text..."
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-600 uppercase font-bold">Koko (mm)</span>
                        <div className="relative">
                          <select 
                            value={selectedEngraving.fontSize * 10}
                            onChange={(e) => updateEngraving(selectedEngraving.id, { fontSize: Number(e.target.value) / 10 })}
                            className="w-full bg-[#222222] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400 appearance-none"
                          >
                            {(selectedEngraving.category === 'firstName' ? FIRST_NAME_SIZES : 
                              selectedEngraving.category === 'lastName' ? LAST_NAME_SIZES : 
                              (selectedEngraving.category === 'birthDate' || selectedEngraving.category === 'deathDate') ? DATE_SIZES : 
                              [25, 40, 50, 60, 70, 80]).map(size => (
                              <option key={size} value={size}>{size}mm</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600" size={14} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-600 uppercase font-bold">Välistys</span>
                        <input 
                          type="number"
                          step="0.05"
                          value={selectedEngraving.letterSpacing || 1}
                          onChange={(e) => updateEngraving(selectedEngraving.id, { letterSpacing: Number(e.target.value) })}
                          className="w-full bg-[#222222] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400"
                        />
                      </div>
                    </div>

                    {(selectedEngraving.category === 'birthDate' || selectedEngraving.category === 'deathDate') && (
                      <div className="flex items-center justify-between p-3 bg-[#222222] border border-white/10 rounded-lg">
                        <span className="text-xs font-medium text-zinc-400">Lisää merkki ({selectedEngraving.category === 'birthDate' ? '*' : '†'})</span>
                        <button
                          onClick={() => updateEngraving(selectedEngraving.id, { showSymbol: !selectedEngraving.showSymbol })}
                          className={cn(
                            "w-10 h-5 rounded-full transition-all relative",
                            selectedEngraving.showSymbol ? "bg-zinc-400" : "bg-zinc-800"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                            selectedEngraving.showSymbol ? "right-1" : "left-1"
                          )} />
                        </button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-600 uppercase font-bold">Väri</span>
                      <div className="flex gap-3">
                        {LETTERING_COLORS.map(color => (
                          <button
                            key={color.value}
                            onClick={() => updateEngraving(selectedEngraving.id, { color: color.value })}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 transition-all",
                              selectedEngraving.color === color.value 
                                ? "bg-zinc-800 border-zinc-400 text-white" 
                                : "bg-[#222222] text-zinc-400 hover:border-zinc-600"
                            )}
                          >
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.value }} />
                            <span className="text-xs font-medium">{color.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {selectedEngraving.type === 'cross' && (
                  <div className="space-y-4">
                    <div className="py-4 text-center border border-dashed border-white/5 rounded-xl">
                      <p className="text-xs text-zinc-600 italic">Fixed size: 5x15cm</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] text-zinc-600 uppercase font-bold">Väri</span>
                      <div className="flex gap-3">
                        {LETTERING_COLORS.map(color => (
                          <button
                            key={color.value}
                            onClick={() => updateEngraving(selectedEngraving.id, { color: color.value })}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 transition-all",
                              selectedEngraving.color === color.value 
                                ? "bg-zinc-800 border-zinc-400 text-white" 
                                : "bg-[#222222] text-zinc-400 hover:border-zinc-600"
                            )}
                          >
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.value }} />
                            <span className="text-xs font-medium">{color.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {selectedEngraving.type === 'cutout' && (
                  <div className="py-4 text-center border border-dashed border-white/5 rounded-xl">
                    <p className="text-xs text-zinc-600 italic">Fixed size: 12x24cm</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={handleExport}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
          >
            <Download size={16} />
            Tallenna kuva
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 relative flex flex-col">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0f0f0f]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <Move size={14} />
              <span>Drag elements to reposition</span>
            </div>
          </div>
        </header>

        <div 
          id="canvas-container" 
          className="flex-1 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px] flex items-center justify-center overflow-hidden"
          onClick={() => handleSelect(null)}
        >
          <div className="relative shadow-2xl shadow-black/50">
            <Stage
              width={selectedSize.width * scale}
              height={selectedSize.height * scale}
              ref={stageRef}
              onMouseDown={(e) => {
                const clickedOnEmpty = e.target === e.target.getStage();
                if (clickedOnEmpty) handleSelect(null);
              }}
            >
              <Layer>
                {/* The Stone */}
                {(() => {
                  const selectedStone = STONE_COLORS.find(c => c.value === stoneColor);
                  const texture = selectedStone?.label === "Musta" ? blackTexture : greyTexture;
                  
                  return (
                    <Rect
                      width={selectedSize.width * scale}
                      height={selectedSize.height * scale}
                      fill={!texture ? stoneColor : undefined}
                      fillPatternImage={texture}
                      fillPatternScale={{ 
                        x: (selectedSize.width * scale) / (texture?.width || 1), 
                        y: (selectedSize.height * scale) / (texture?.height || 1) 
                      }}
                      shadowBlur={30}
                      shadowColor="rgba(0,0,0,0.6)"
                      shadowOffset={{ x: 10, y: 10 }}
                      cornerRadius={4}
                      stroke="#333"
                      strokeWidth={1}
                    />
                  );
                })()}
                
                {/* Bevel Effect */}
                <Rect
                  width={selectedSize.width * scale}
                  height={selectedSize.height * scale}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={4}
                  cornerRadius={4}
                  listening={false}
                />
                <Rect
                  width={selectedSize.width * scale}
                  height={selectedSize.height * scale}
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={1}
                  cornerRadius={4}
                  listening={false}
                />
                
                {/* Subtle Texture */}
                <Rect
                  width={selectedSize.width * scale}
                  height={selectedSize.height * scale}
                  fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                  fillLinearGradientEndPoint={{ x: selectedSize.width * scale, y: selectedSize.height * scale }}
                  fillLinearGradientColorStops={[0, 'rgba(255,255,255,0.02)', 1, 'rgba(0,0,0,0.2)']}
                  cornerRadius={4}
                  listening={false}
                />

                {/* Engravings */}
                {engravings.map((eng) => (
                  eng.type === 'cutout' ? (
                    <Rect
                      key={eng.id}
                      id={eng.id}
                      x={eng.x * scale}
                      y={eng.y * scale}
                      width={(eng.width || 12) * scale}
                      height={(eng.height || 24) * scale}
                      fill="#0a0a0a"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={1}
                      cornerRadius={4}
                      draggable
                      onDragStart={() => {
                        handleSelect(eng.id);
                        updateEngraving(eng.id, { isDragging: true });
                      }}
                      onDragEnd={(e) => {
                        updateEngraving(eng.id, {
                          x: e.target.x() / scale,
                          y: e.target.y() / scale,
                          isDragging: false,
                        });
                      }}
                      onClick={() => handleSelect(eng.id)}
                      onTap={() => handleSelect(eng.id)}
                      offsetX={((eng.width || 12) * scale) / 2}
                      offsetY={((eng.height || 24) * scale) / 2}
                      shadowBlur={10}
                      shadowColor="rgba(0,0,0,0.5)"
                      shadowInset
                    />
                  ) : eng.type === 'cross' ? (
                    <Group
                      key={eng.id}
                      id={eng.id}
                      x={eng.x * scale}
                      y={eng.y * scale}
                      draggable
                      onDragStart={() => {
                        handleSelect(eng.id);
                        updateEngraving(eng.id, { isDragging: true });
                      }}
                      onDragEnd={(e) => {
                        updateEngraving(eng.id, {
                          x: e.target.x() / scale,
                          y: e.target.y() / scale,
                          isDragging: false,
                        });
                      }}
                      onClick={() => handleSelect(eng.id)}
                      onTap={() => handleSelect(eng.id)}
                      offsetX={((eng.width || 5) * scale) / 2}
                      offsetY={((eng.height || 15) * scale) / 2}
                    >
                      {/* Vertical Bar - 9mm thickness */}
                      <Rect
                        x={((eng.width || 5) * scale) / 2 - (0.9 * scale) / 2}
                        y={0}
                        width={0.9 * scale}
                        height={(eng.height || 15) * scale}
                        fill={eng.color}
                        cornerRadius={0.45 * scale}
                        shadowColor="black"
                        shadowBlur={2}
                        shadowOffset={{ x: 1, y: 1 }}
                        shadowOpacity={0.5}
                      />
                      {/* Horizontal Bar - 9mm thickness */}
                      <Rect
                        x={0}
                        y={3 * scale}
                        width={(eng.width || 5) * scale}
                        height={0.9 * scale}
                        fill={eng.color}
                        cornerRadius={0.45 * scale}
                        shadowColor="black"
                        shadowBlur={2}
                        shadowOffset={{ x: 1, y: 1 }}
                        shadowOpacity={0.5}
                      />
                    </Group>
                  ) : (
                    <Group
                      key={eng.id}
                      id={eng.id}
                      x={eng.x * scale}
                      y={eng.y * scale}
                      draggable
                      onDragStart={() => {
                        handleSelect(eng.id);
                        updateEngraving(eng.id, { isDragging: true });
                      }}
                      onDragEnd={(e) => {
                        updateEngraving(eng.id, {
                          x: e.target.x() / scale,
                          y: e.target.y() / scale,
                          isDragging: false,
                        });
                      }}
                      onClick={() => handleSelect(eng.id)}
                      onTap={() => handleSelect(eng.id)}
                      offsetX={eng.type === 'symbol' ? (eng.fontSize * scale * 0.5) / 2 : (eng.text.split('\n').reduce((max, line) => Math.max(max, line.length), 0) * (eng.fontSize * scale * 0.5 + (eng.letterSpacing || 1) * scale)) / 2}
                    >
                      {eng.showSymbol && (
                        <>
                          {eng.category === 'birthDate' ? (
                            <Star
                              numPoints={5}
                              innerRadius={(eng.fontSize * scale) * 0.2}
                              outerRadius={(eng.fontSize * scale) * 0.4}
                              fill={eng.color}
                              x={-((eng.fontSize * scale) * 0.6)}
                              y={(eng.fontSize * scale) * 0.5}
                              shadowColor="black"
                              shadowBlur={1}
                              shadowOffset={{ x: 1, y: 1 }}
                              shadowOpacity={0.5}
                            />
                          ) : eng.category === 'deathDate' ? (
                            <Path
                              data="M 0,0 m -1,-1 l -4,-9 h 10 l -4,9 m 2,2 l 9,-4 v 10 l -9,-4 m -2,2 l 4,9 h -10 l 4,-9 m -2,-2 l -9,4 v -10 l 9,4 Z"
                              fill={eng.color}
                              x={-((eng.fontSize * scale) * 0.6)}
                              y={(eng.fontSize * scale) * 0.5}
                              scaleX={eng.fontSize * scale * 0.04}
                              scaleY={eng.fontSize * scale * 0.04}
                              shadowColor="black"
                              shadowBlur={1}
                              shadowOffset={{ x: 1, y: 1 }}
                              shadowOpacity={0.5}
                            />
                          ) : null}
                        </>
                      )}
                      <Text
                        name="engraving"
                        text={eng.text}
                        fontSize={eng.fontSize * scale}
                        fontFamily={eng.fontFamily}
                        fontStyle={eng.fontStyle}
                        fill={eng.color}
                        align="center"
                        letterSpacing={(eng.letterSpacing || 1) * scale}
                        shadowColor="black"
                        shadowBlur={2}
                        shadowOffset={{ x: 2, y: 2 }}
                        shadowOpacity={0.8}
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth={0.5}
                      />
                    </Group>
                  )
                ))}

                {/* Selection Transformer */}
                {selectedId && (
                  <Transformer
                    ref={(node) => {
                      if (node && stageRef.current) {
                        const selectedNode = stageRef.current.findOne('#' + selectedId);
                        if (selectedNode) {
                          node.nodes([selectedNode]);
                          node.getLayer().batchDraw();
                        }
                      }
                    }}
                    rotateEnabled={false}
                    enabledAnchors={[]}
                    borderStroke="#fff"
                    borderStrokeWidth={1}
                  />
                )}
              </Layer>
            </Stage>
          </div>
        </div>

        <footer className="h-12 border-t border-white/5 flex items-center justify-between px-8 bg-[#0f0f0f] text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
          <div className="flex gap-6">
            <span>Height: {selectedSize.height}cm</span>
            <span>Width: {selectedSize.width}cm</span>
          </div>
          <div>Scale: {scale.toFixed(1)}px/cm</div>
        </footer>
      </main>
    </div>
  );
}
