import { useState, useEffect, useCallback } from 'react';
import { requireSupabase } from './useSupabase';
export function useChildren(parentId) {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!parentId)
            return;
        const sb = requireSupabase();
        sb.from('children').select('*').eq('parent_id', parentId).then(({ data, error }) => {
            if (!error && data)
                setChildren(data);
            setLoading(false);
        });
    }, [parentId]);
    return { children, loading };
}
export function useAllChildren() {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const sb = requireSupabase();
        sb.from('children').select('*').then(({ data, error }) => {
            if (!error && data)
                setChildren(data);
            setLoading(false);
        });
    }, []);
    return { children, loading };
}
export function useArizas(parentId) {
    const [arizas, setArizas] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetch = useCallback(async () => {
        if (!parentId)
            return;
        const sb = requireSupabase();
        const { data, error } = await sb.from('ariza_requests').select('*').eq('parent_id', parentId).order('created_at', { ascending: false });
        if (!error && data)
            setArizas(data);
        setLoading(false);
    }, [parentId]);
    useEffect(() => { fetch(); }, [fetch]);
    const create = useCallback(async (input) => {
        if (!parentId)
            return;
        const sb = requireSupabase();
        const { data, error } = await sb.from('ariza_requests').insert({
            child_id: input.child_id,
            parent_id: parentId,
            date_from: input.date_from,
            date_to: input.date_to,
            reason_text: input.reason_text,
            doctor_paper_url: input.doctor_paper_url || null,
        }).select().single();
        if (!error && data) {
            setArizas((prev) => [data, ...prev]);
        }
        return { data, error };
    }, [parentId]);
    return { arizas, loading, create };
}
export function useTeacherArizas() {
    const [arizas, setArizas] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetch = useCallback(async () => {
        const sb = requireSupabase();
        const { data, error } = await sb.from('ariza_requests').select('*').order('created_at', { ascending: false });
        if (!error && data)
            setArizas(data);
        setLoading(false);
    }, []);
    useEffect(() => { fetch(); }, [fetch]);
    const moderate = useCallback(async (id, status, teacherId, rejectionReason) => {
        const sb = requireSupabase();
        const updates = { status, teacher_id: teacherId };
        if (rejectionReason)
            updates.rejection_reason = rejectionReason;
        const { data, error } = await sb.from('ariza_requests').update(updates).eq('id', id).select().single();
        if (!error && data) {
            setArizas((prev) => prev.map((a) => (a.id === id ? data : a)));
        }
        return { data, error };
    }, []);
    return { arizas, loading, moderate };
}
export function useBildirgis(studentId) {
    const [bildirgis, setBildirgis] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const sb = requireSupabase();
        let q = sb.from('bildirgi_records').select('*').order('created_at', { ascending: false });
        if (studentId)
            q = q.eq('student_id', studentId);
        q.then(({ data, error }) => {
            if (!error && data)
                setBildirgis(data);
            setLoading(false);
        });
    }, [studentId]);
    const create = useCallback(async (input) => {
        const sb = requireSupabase();
        const { data, error } = await sb.from('bildirgi_records').insert(input).select().single();
        if (!error && data) {
            setBildirgis((prev) => [data, ...prev]);
        }
        return { data, error };
    }, []);
    return { bildirgis, loading, create };
}
export function useAllBildirgis() {
    const [bildirgis, setBildirgis] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const sb = requireSupabase();
        sb.from('bildirgi_records').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
            if (!error && data)
                setBildirgis(data);
            setLoading(false);
        });
    }, []);
    return { bildirgis, loading };
}
export async function uploadFile(file, bucket = 'uploads') {
    const sb = requireSupabase();
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await sb.storage.from(bucket).upload(path, file);
    if (error)
        throw error;
    const { data } = sb.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}
