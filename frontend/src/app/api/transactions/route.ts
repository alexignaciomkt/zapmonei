import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { tipo, valor, categoria, descricao, contexto, ocorrencia_em, user_id } = body;

    let finalUserId = user_id;

    // Se o user_id não vier, buscamos pelo usuário logado
    if (!finalUserId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('API Auth Check:', { user: user?.id, error: authError });
      
      if (user) {
        // 1. Busca o ID interno na tabela public.users pelo auth_user_id
        let { data: profile } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        
        // 2. Se não achou pelo auth_user_id, tenta pelo número de WhatsApp
        if (!profile) {
          const whatsapp = user.user_metadata?.whatsapp || user.email?.split('@')[0];
          const { data: profileByWa } = await supabase
            .from('users')
            .select('id')
            .eq('whatsapp_number', whatsapp)
            .maybeSingle();
          
          if (profileByWa) {
            // Vincula o auth_user_id ao perfil existente
            await supabase
              .from('users')
              .update({ auth_user_id: user.id })
              .eq('id', profileByWa.id);
            profile = profileByWa;
          }
        }

        // 3. Se ainda assim não existe, cria ele agora
        if (!profile) {
          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert([
              {
                auth_user_id: user.id,
                nome: user.user_metadata?.full_name || 'Motorista',
                whatsapp_number: user.user_metadata?.whatsapp || user.email?.split('@')[0],
                onboarding_status: 'completed'
              }
            ])
            .select('id')
            .single();

          if (createError) {
            console.error('Erro ao criar perfil:', createError);
            return NextResponse.json({ error: `Erro ao criar perfil: ${createError.message}` }, { status: 500 });
          }
          
          if (newProfile) {
            profile = newProfile;
          }
        }
        
        finalUserId = profile?.id;
      }
    }

    if (!finalUserId) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) return NextResponse.json({ error: `Erro de Auth: ${authError.message}` }, { status: 401 });
      if (!user) return NextResponse.json({ error: 'Sessão inválida ou expirada' }, { status: 401 });

      return NextResponse.json({ error: 'Perfil do usuário não encontrado no banco' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: finalUserId,
          tipo,
          valor,
          categoria,
          descricao,
          contexto,
          ocorrencia_em: ocorrencia_em || new Date().toISOString(),
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
