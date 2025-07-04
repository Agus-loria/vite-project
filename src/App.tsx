import React, { useState } from 'react';
import { Users, DollarSign, Check, X, Plus, Trash2, CheckCircle, Edit, Mail, UserPlus, Crown, Shield, Eye } from 'lucide-react';

const LDTCollaborativeApp = () => {
  // Estados principales
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentNames, setCurrentNames] = useState('');
  const [costPerPerson, setCostPerPerson] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [groupEmails, setGroupEmails] = useState({});
  
  // Estados de autenticación y colaboración
  const [isOwner, setIsOwner] = useState(false);
  const [userPermissions, setUserPermissions] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermissions, setInvitePermissions] = useState({
    canAddGroups: false,
    canMarkPayments: false
  });

  // Funciones de autenticación
  const handleLogin = () => {
    if (!authEmail.includes('@')) {
      alert('Ingresá un email válido');
      return;
    }

    // Simular owner (si es tu email)
    const ownerEmails = ['ldt@gmail.com', 'owner@ldt.com'];
    const newIsOwner = ownerEmails.includes(authEmail.toLowerCase());
    
    const newUser = {
      id: Date.now().toString(),
      email: authEmail,
      isOwner: newIsOwner,
      joinedAt: new Date()
    };

    setUser(newUser);
    setIsOwner(newIsOwner);
    
    // Configurar permisos
    if (newIsOwner) {
      setUserPermissions({ canAddGroups: true, canMarkPayments: true });
    } else {
      // Buscar si fue invitado
      const invitation = users.find(u => u.email.toLowerCase() === authEmail.toLowerCase());
      if (invitation) {
        setUserPermissions(invitation.permissions);
        // Marcar como aceptado
        setUsers(users.map(u => 
          u.email.toLowerCase() === authEmail.toLowerCase() 
            ? { ...u, status: 'accepted', acceptedAt: new Date() }
            : u
        ));
        alert(`🎉 ¡Bienvenido a LDT!

Tus permisos:
${invitation.permissions.canAddGroups ? '✅' : '❌'} Agregar grupos
${invitation.permissions.canMarkPayments ? '✅' : '❌'} Marcar pagos

Invitado por: ${invitation.invitedBy}`);
      } else {
        setUserPermissions({ canAddGroups: false, canMarkPayments: false });
        alert(`❌ No tenés permisos asignados.
        
Contactá al owner para que te invite al grupo LDT.`);
      }
    }
    
    setShowAuthModal(false);
  };

  // Funciones de invitación
  const sendInvitation = () => {
    if (!inviteEmail.includes('@')) {
      alert('Ingresá un email válido');
      return;
    }

    const newInvite = {
      id: Date.now().toString(),
      email: inviteEmail,
      permissions: invitePermissions,
      invitedBy: user.email,
      invitedAt: new Date(),
      status: 'pending'
    };

    setUsers([...users, newInvite]);
    setInviteEmail('');
    setInvitePermissions({ canAddGroups: false, canMarkPayments: false });
    setShowInviteModal(false);

    alert(`📧 Invitación enviada a ${inviteEmail}!
    
Permisos otorgados:
${invitePermissions.canAddGroups ? '✅' : '❌'} Agregar grupos
${invitePermissions.canMarkPayments ? '✅' : '❌'} Marcar pagos`);
  };

  // Funciones de grupos (existentes con validación de permisos)
  const createGroup = () => {
    if (!userPermissions.canAddGroups && !isOwner) {
      alert('No tenés permisos para agregar grupos');
      return;
    }

    if (!currentNames.trim()) return;
    
    const names = currentNames
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (names.length === 0) return;

    const newGroup = {
      id: groups.length + 1,
      members: names.map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name,
        paid: false
      })),
      createdBy: user.email,
      createdAt: new Date()
    };

    setGroups([...groups, newGroup]);
    setCurrentNames('');

    // Simular notificación en tiempo real
    setTimeout(() => {
      alert(`🔄 Grupo ${newGroup.id} creado por ${user.email}`);
    }, 500);
  };

  const togglePayment = (groupId, memberId) => {
    if (!userPermissions.canMarkPayments && !isOwner) {
      alert('No tenés permisos para marcar pagos');
      return;
    }

    setGroups(groups.map(group => 
      group.id === groupId 
        ? {
            ...group,
            members: group.members.map(member =>
              member.id === memberId 
                ? { ...member, paid: !member.paid }
                : member
            )
          }
        : group
    ));
  };

  const markGroupAsPaid = (groupId) => {
    if (!userPermissions.canMarkPayments && !isOwner) {
      alert('No tenés permisos para marcar pagos');
      return;
    }

    setGroups(groups.map(group => 
      group.id === groupId 
        ? {
            ...group,
            members: group.members.map(member => ({ ...member, paid: true }))
          }
        : group
    ));
  };

  const setGroupPaidCount = (groupId, paidCount) => {
    if (!userPermissions.canMarkPayments && !isOwner) {
      alert('No tenés permisos para marcar pagos');
      return;
    }

    setGroups(groups.map(group => 
      group.id === groupId 
        ? {
            ...group,
            members: group.members.map((member, index) => ({
              ...member,
              paid: index < paidCount
            }))
          }
        : group
    ));
  };

  const handleEditClick = (groupId, currentPaid) => {
    setEditingGroup(groupId);
    setEditValue(currentPaid.toString());
  };

  const handleEditSave = (groupId, totalMembers) => {
    const newPaidCount = Math.max(0, Math.min(parseInt(editValue) || 0, totalMembers));
    setGroupPaidCount(groupId, newPaidCount);
    setEditingGroup(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingGroup(null);
    setEditValue('');
  };

  const updateGroupEmail = (groupId, email) => {
    setGroupEmails({
      ...groupEmails,
      [groupId]: email
    });
  };

  const deleteGroup = (groupId) => {
    if (!isOwner) {
      alert('Solo el owner puede eliminar grupos');
      return;
    }
    setGroups(groups.filter(group => group.id !== groupId));
  };

  // Funciones de estadísticas
  const getGroupStats = (group) => {
    const totalMembers = group.members.length;
    const paidMembers = group.members.filter(m => m.paid).length;
    const cost = parseFloat(costPerPerson) || 0;
    const totalCollected = paidMembers * cost;
    const totalExpected = totalMembers * cost;
    
    return {
      totalMembers,
      paidMembers,
      totalCollected,
      totalExpected,
      percentage: totalMembers > 0 ? (paidMembers / totalMembers) * 100 : 0
    };
  };

  const getOverallStats = () => {
    const allMembers = groups.flatMap(group => group.members);
    const totalMembers = allMembers.length;
    const paidMembers = allMembers.filter(m => m.paid).length;
    const cost = parseFloat(costPerPerson) || 0;
    const totalCollected = paidMembers * cost;
    const totalExpected = totalMembers * cost;

    return {
      totalMembers,
      paidMembers,
      totalCollected,
      totalExpected,
      percentage: totalMembers > 0 ? (paidMembers / totalMembers) * 100 : 0
    };
  };

  const overallStats = getOverallStats();

  // Modal de autenticación
  if (showAuthModal) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-md w-full">
          <h1 className="text-4xl font-black text-center mb-2">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              LDT
            </span>
          </h1>
          <div className="w-16 h-1 bg-white mx-auto mb-6"></div>
          
          <h2 className="text-xl font-bold mb-4">Acceso Colaborativo</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Ingresá tu email para recibir un magic link y acceder a la organización de la joda
          </p>
          
          <input
            type="email"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            placeholder="tu-email@gmail.com"
            className="w-full p-3 bg-black border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white mb-4"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          
          <button
            onClick={handleLogin}
            className="w-full bg-white text-black py-3 px-6 rounded font-black hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            ENVIAR MAGIC LINK
          </button>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            Demo: usá "ldt@gmail.com" para ser owner con todos los permisos
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header con info del usuario */}
        <div className="text-center mb-8 py-8">
          <h1 className="text-6xl font-black text-white mb-2 tracking-wider">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              LDT
            </span>
          </h1>
          <div className="w-24 h-1 bg-white mx-auto mb-4"></div>
          <p className="text-xl text-gray-300 font-light">JODA 26/07 - MODO COLABORATIVO</p>
          
          {/* Info del usuario */}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              {isOwner ? <Crown className="w-4 h-4 text-yellow-400" /> : <Users className="w-4 h-4 text-blue-400" />}
              <span>{user.email}</span>
              <span className="text-gray-500">
                {isOwner ? '(OWNER)' : '(COLABORADOR)'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-3 h-3" />
              {userPermissions.canAddGroups ? '✅ Grupos' : '❌ Grupos'}
              {userPermissions.canMarkPayments ? '✅ Pagos' : '❌ Pagos'}
            </div>
            
            {isOwner && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" />
                INVITAR
              </button>
            )}
          </div>
        </div>

        {/* Usuarios conectados */}
        {isOwner && users.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold mb-3">👥 COLABORADORES ({users.length})</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {users.map((invitedUser) => (
                <div key={invitedUser.id} className={`rounded p-3 text-sm ${
                  invitedUser.status === 'accepted' ? 'bg-green-900 border border-green-700' : 'bg-black'
                }`}>
                  <div className="font-bold flex items-center gap-2">
                    {invitedUser.status === 'accepted' ? '🟢' : '⏳'} {invitedUser.email}
                  </div>
                  <div className="text-xs text-gray-400">
                    {invitedUser.permissions.canAddGroups ? '✅' : '❌'} Grupos •{' '}
                    {invitedUser.permissions.canMarkPayments ? '✅' : '❌'} Pagos
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {invitedUser.status === 'accepted' ? '✅ Conectado' : '⏳ Pendiente'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Overview */}
        {groups.length > 0 && (
          <div className="bg-white text-black rounded-lg p-6 mb-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Resumen General
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-green-600">{overallStats.paidMembers}</div>
                <div className="text-sm text-gray-600 font-medium">Pagaron</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-red-600">{overallStats.totalMembers - overallStats.paidMembers}</div>
                <div className="text-sm text-gray-600 font-medium">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-blue-600">${overallStats.totalCollected}</div>
                <div className="text-sm text-gray-600 font-medium">Recaudado</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-purple-600">${overallStats.totalExpected}</div>
                <div className="text-sm text-gray-600 font-medium">Total Esperado</div>
              </div>
            </div>
            <div className="mt-6">
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-black to-gray-800 h-full transition-all duration-500"
                  style={{ width: `${overallStats.percentage}%` }}
                />
              </div>
              <div className="text-center text-black mt-2 font-bold">
                {overallStats.percentage.toFixed(1)}% COMPLETADO
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        {(userPermissions.canAddGroups || isOwner) && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Crear Nuevo Grupo
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2 font-bold">
                  NOMBRES (UNO POR LÍNEA):
                </label>
                <textarea
                  value={currentNames}
                  onChange={(e) => setCurrentNames(e.target.value)}
                  placeholder="Agustín Loria&#10;Marcos Pérez&#10;Lisandro Chube&#10;Pedro Mercantoni"
                  className="w-full h-32 p-3 bg-black border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white resize-none"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2 font-bold">
                  COSTO POR PERSONA ($):
                </label>
                <input
                  type="number"
                  value={costPerPerson}
                  onChange={(e) => setCostPerPerson(e.target.value)}
                  placeholder="Ej: 5000"
                  className="w-full p-3 bg-black border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                />
                
                <button
                  onClick={createGroup}
                  className="w-full mt-4 bg-white text-black py-3 px-6 rounded font-black hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  CREAR GRUPO {groups.length + 1}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Groups Section */}
        <div className="space-y-6">
          {groups.map((group) => {
            const stats = getGroupStats(group);
            return (
              <div key={group.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                      <Users className="w-6 h-6" />
                      GRUPO {group.id}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm font-bold">GMAIL:</span>
                      <input
                        type="email"
                        value={groupEmails[group.id] || ''}
                        onChange={(e) => updateGroupEmail(group.id, e.target.value)}
                        placeholder="email@gmail.com"
                        className="bg-black border border-gray-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white w-48"
                        disabled={!isOwner}
                      />
                    </div>
                    {group.createdBy && (
                      <div className="text-xs text-gray-500">
                        por {group.createdBy}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-800 px-4 py-2 rounded border border-gray-700 flex items-center gap-2">
                      {editingGroup === group.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleEditSave(group.id, stats.totalMembers);
                              } else if (e.key === 'Escape') {
                                handleEditCancel();
                              }
                            }}
                            className="w-12 bg-black text-white text-center rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-white"
                            min="0"
                            max={stats.totalMembers}
                            autoFocus
                            disabled={!userPermissions.canMarkPayments && !isOwner}
                          />
                          <span className="text-white font-black">/{stats.totalMembers}</span>
                          <button
                            onClick={() => handleEditSave(group.id, stats.totalMembers)}
                            className="text-green-400 hover:text-green-300 text-xs"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className={`flex items-center gap-2 px-2 py-1 rounded transition-colors ${
                            (userPermissions.canMarkPayments || isOwner) 
                              ? 'cursor-pointer hover:bg-gray-700' 
                              : 'cursor-not-allowed opacity-50'
                          }`}
                          onClick={() => (userPermissions.canMarkPayments || isOwner) && handleEditClick(group.id, stats.paidMembers)}
                        >
                          <span className="text-white font-black text-lg">
                            {stats.paidMembers}/{stats.totalMembers}
                          </span>
                          <span className="text-gray-400 text-sm">PAGARON</span>
                          {(userPermissions.canMarkPayments || isOwner) && <Edit className="w-3 h-3 text-gray-500" />}
                          {(!userPermissions.canMarkPayments && !isOwner) && <Eye className="w-3 h-3 text-gray-600" />}
                        </div>
                      )}
                    </div>
                    
                    {(userPermissions.canMarkPayments || isOwner) && (
                      <button
                        onClick={() => markGroupAsPaid(group.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        PAGAR GRUPO
                      </button>
                    )}
                    
                    {isOwner && (
                      <button
                        onClick={() => deleteGroup(group.id)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Group Stats */}
                <div className="bg-white text-black rounded p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-black text-green-600">{stats.paidMembers}</div>
                      <div className="text-xs text-gray-600 font-bold">PAGARON</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-red-600">{stats.totalMembers - stats.paidMembers}</div>
                      <div className="text-xs text-gray-600 font-bold">PENDIENTES</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-blue-600">${stats.totalCollected}</div>
                      <div className="text-xs text-gray-600 font-bold">RECAUDADO</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-purple-600">${stats.totalExpected}</div>
                      <div className="text-xs text-gray-600 font-bold">TOTAL ESPERADO</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-black to-gray-800 h-full transition-all duration-500"
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                    <div className="text-center text-black mt-2 font-black text-sm">
                      {stats.percentage.toFixed(1)}% DEL GRUPO
                    </div>
                  </div>
                </div>

                {/* Members List */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className={`p-4 rounded border-2 transition-all duration-300 ${
                        member.paid
                          ? 'bg-green-900 border-green-500 text-green-100'
                          : 'bg-red-900 border-red-500 text-red-100'
                      } ${
                        (userPermissions.canMarkPayments || isOwner) 
                          ? 'cursor-pointer' 
                          : 'cursor-default opacity-75'
                      }`}
                      onClick={() => (userPermissions.canMarkPayments || isOwner) && togglePayment(group.id, member.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{member.name}</span>
                        <div className="flex items-center gap-2">
                          {member.paid ? (
                            <Check className="w-5 h-5 text-green-400" />
                          ) : (
                            <X className="w-5 h-5 text-red-400" />
                          )}
                          {(!userPermissions.canMarkPayments && !isOwner) && (
                            <Eye className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                      <div className="text-sm mt-1 font-bold">
                        {member.paid ? 'PAGÓ' : 'PENDIENTE'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-light">
              {userPermissions.canAddGroups || isOwner 
                ? 'Agregá los nombres arriba para crear tu primer grupo'
                : 'Esperando que alguien con permisos cree grupos...'
              }
            </p>
          </div>
        )}

        {/* Modal de invitación */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">👥 INVITAR COLABORADOR</h3>
              
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@gmail.com"
                className="w-full p-3 bg-black border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white mb-4"
              />
              
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">PERMISOS:</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={invitePermissions.canAddGroups}
                      onChange={(e) => setInvitePermissions({
                        ...invitePermissions,
                        canAddGroups: e.target.checked
                      })}
                      className="rounded"
                    />
                    <span>Puede agregar grupos</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={invitePermissions.canMarkPayments}
                      onChange={(e) => setInvitePermissions({
                        ...invitePermissions,
                        canMarkPayments: e.target.checked
                      })}
                      className="rounded"
                    />
                    <span>Puede marcar pagos</span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={sendInvitation}
                  className="flex-1 bg-white text-black py-2 px-4 rounded font-bold hover:bg-gray-200 transition-colors"
                >
                  ENVIAR INVITACIÓN
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 bg-gray-700 text-white py-2 px-4 rounded font-bold hover:bg-gray-600 transition-colors"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 py-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>🎉 LDT Collaborative App - JODA 26/07</p>
          <p className="mt-1">
            Conectado como: <span className="text-white">{user.email}</span>
            {isOwner && <span className="text-yellow-400 ml-2">👑 OWNER</span>}
          </p>
          <p className="mt-2 text-xs text-gray-600">
            💡 Compartí este link con LDT para que colaboren en tiempo real
          </p>
        </div>
      </div>
    </div>
  );
};

export default LDTCollaborativeApp;
