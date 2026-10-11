-- ==============================================================================
-- FIX-LOOP DATABASE SCHEMA & SECURITY POLICIES
-- Platform: Supabase PostgreSQL
-- ==============================================================================

-- 1. Create Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Communities Table
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Admin Community Assignments Table
CREATE TABLE IF NOT EXISTS public.admin_community_assignments (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, community_id)
);

-- 4. Reports Table
-- Non-negotiable 5 Canonical Thai Statuses:
-- 1. รอตรวจสอบ
-- 2. รับเรื่องแล้ว
-- 3. กำลังดำเนินการ
-- 4. รอหน่วยงานภายนอก
-- 5. แก้ไขแล้ว
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_tracking_id TEXT NOT NULL UNIQUE,
    tracking_token TEXT NOT NULL UNIQUE,
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE RESTRICT,
    category TEXT NOT NULL CHECK (category IN ('ถนน/ทางเท้า', 'ไฟฟ้า/ไฟส่องสว่าง', 'ขยะ/สิ่งปฏิกูล', 'ท่อระบายน้ำ/น้ำท่วม', 'อื่นๆ')),
    title VARCHAR(150) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    location_text VARCHAR(500) NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'รอตรวจสอบ' CHECK (
        status IN ('รอตรวจสอบ', 'รับเรื่องแล้ว', 'กำลังดำเนินการ', 'รอหน่วยงานภายนอก', 'แก้ไขแล้ว')
    ),
    reporter_contact VARCHAR(100), -- Strictly private. Never returned to public tracking.
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Report Status History Table
CREATE TABLE IF NOT EXISTS public.report_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    previous_status TEXT CHECK (
        previous_status IS NULL OR
        previous_status IN ('รอตรวจสอบ', 'รับเรื่องแล้ว', 'กำลังดำเนินการ', 'รอหน่วยงานภายนอก', 'แก้ไขแล้ว')
    ),
    new_status TEXT NOT NULL CHECK (
        new_status IN ('รอตรวจสอบ', 'รับเรื่องแล้ว', 'กำลังดำเนินการ', 'รอหน่วยงานภายนอก', 'แก้ไขแล้ว')
    ),
    note VARCHAR(200) CHECK (char_length(note) <= 200),
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Indexes for High-Performance & Security
CREATE INDEX IF NOT EXISTS idx_reports_tracking_token ON public.reports(tracking_token);
CREATE INDEX IF NOT EXISTS idx_reports_community_id ON public.reports(community_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_report_id ON public.report_status_history(report_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_assignments_user ON public.admin_community_assignments(user_id);

-- 7. Row Level Security (RLS) Configuration
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_community_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;

-- 7.1 Communities Policies
-- Public can read communities (to select when submitting report)
CREATE POLICY "Public can view active communities"
    ON public.communities
    FOR SELECT
    USING (true);

-- 7.2 Admin Community Assignments Policies
-- Admins can only view their own assignments
CREATE POLICY "Admins can view their own community assignments"
    ON public.admin_community_assignments
    FOR SELECT
    USING (auth.uid() = user_id);

-- 7.3 Reports Policies
-- Anonymous users CANNOT enumerate or select all reports directly.
-- Authorized Admins can SELECT reports ONLY for assigned communities.
CREATE POLICY "Admins can view reports for assigned communities"
    ON public.reports
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_community_assignments a
            WHERE a.user_id = auth.uid()
            AND a.community_id = public.reports.community_id
        )
    );

-- Admins can UPDATE reports ONLY for assigned communities.
CREATE POLICY "Admins can update reports for assigned communities"
    ON public.reports
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_community_assignments a
            WHERE a.user_id = auth.uid()
            AND a.community_id = public.reports.community_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_community_assignments a
            WHERE a.user_id = auth.uid()
            AND a.community_id = public.reports.community_id
        )
    );

-- 7.4 Report Status History Policies
-- Admins can view history for reports in their assigned communities.
CREATE POLICY "Admins can view report history for assigned communities"
    ON public.report_status_history
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.reports r
            JOIN public.admin_community_assignments a ON a.community_id = r.community_id
            WHERE r.id = public.report_status_history.report_id
            AND a.user_id = auth.uid()
        )
    );

-- Admins can insert history for reports in their assigned communities.
CREATE POLICY "Admins can insert report history for assigned communities"
    ON public.report_status_history
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.reports r
            JOIN public.admin_community_assignments a ON a.community_id = r.community_id
            WHERE r.id = public.report_status_history.report_id
            AND a.user_id = auth.uid()
        )
    );

-- 8. Atomic Status Update RPC Function
CREATE OR REPLACE FUNCTION public.update_report_status_atomic(
    p_report_id UUID,
    p_new_status TEXT,
    p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_current_status TEXT;
    v_community_id UUID;
    v_user_id UUID;
    v_is_authorized BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User must be authenticated';
    END IF;

    -- Validate new status
    IF p_new_status NOT IN ('รอตรวจสอบ', 'รับเรื่องแล้ว', 'กำลังดำเนินการ', 'รอหน่วยงานภายนอก', 'แก้ไขแล้ว') THEN
        RAISE EXCEPTION 'Invalid status value: %', p_new_status;
    END IF;

    -- Validate note length
    IF p_note IS NOT NULL AND char_length(p_note) > 200 THEN
        RAISE EXCEPTION 'Note must not exceed 200 characters';
    END IF;

    -- Fetch current report details
    SELECT status, community_id INTO v_current_status, v_community_id
    FROM public.reports
    WHERE id = p_report_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Report not found';
    END IF;

    -- Verify admin authorization for this community
    SELECT EXISTS (
        SELECT 1 FROM public.admin_community_assignments
        WHERE user_id = v_user_id AND community_id = v_community_id
    ) INTO v_is_authorized;

    IF NOT v_is_authorized THEN
        RAISE EXCEPTION 'Forbidden: User is not an authorized administrator for this community';
    END IF;

    -- If status is unchanged and no note provided, do not create duplicate history
    IF v_current_status = p_new_status AND (p_note IS NULL OR trim(p_note) = '') THEN
        RETURN jsonb_build_object('success', true, 'changed', false, 'status', v_current_status);
    END IF;

    -- Update report status
    UPDATE public.reports
    SET status = p_new_status,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_report_id;

    -- Insert into history atomically
    INSERT INTO public.report_status_history (
        report_id,
        previous_status,
        new_status,
        note,
        changed_by
    ) VALUES (
        p_report_id,
        v_current_status,
        p_new_status,
        trim(p_note),
        v_user_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'changed', true,
        'previous_status', v_current_status,
        'new_status', p_new_status
    );
END;
$$;

-- 9. Public Safe Tracking Query RPC Function
-- Exposes ONLY public fields. Prevents anonymous table scans and enumeration attacks.
CREATE OR REPLACE FUNCTION public.get_public_report_by_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_report RECORD;
    v_history JSONB;
BEGIN
    IF p_token IS NULL OR trim(p_token) = '' THEN
        RETURN NULL;
    END IF;

    SELECT
        r.id,
        r.public_tracking_id,
        r.category,
        r.title,
        r.description,
        r.location_text,
        r.image_url,
        r.status,
        r.created_at,
        r.updated_at,
        c.name AS community_name
    INTO v_report
    FROM public.reports r
    JOIN public.communities c ON c.id = r.community_id
    WHERE r.tracking_token = p_token;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Retrieve public status history (newest first, exclude user IDs)
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'new_status', h.new_status,
            'previous_status', h.previous_status,
            'note', h.note,
            'created_at', h.created_at
        ) ORDER BY h.created_at DESC
    ), '[]'::jsonb)
    INTO v_history
    FROM public.report_status_history h
    WHERE h.report_id = v_report.id;

    RETURN jsonb_build_object(
        'public_tracking_id', v_report.public_tracking_id,
        'category', v_report.category,
        'title', v_report.title,
        'description', v_report.description,
        'location_text', v_report.location_text,
        'image_url', v_report.image_url,
        'status', v_report.status,
        'community_name', v_report.community_name,
        'created_at', v_report.created_at,
        'updated_at', v_report.updated_at,
        'history', v_history
    );
END;
$$;

-- Seed Default Communities
INSERT INTO public.communities (name, code, description)
VALUES 
    ('เขตพระนคร (กรุงเทพฯ)', 'BKK-PRN', 'ครอบคลุมพื้นที่เขตพระนครและเกาะรัตนโกสินทร์'),
    ('เขตปทุมวัน (กรุงเทพฯ)', 'BKK-PTW', 'ย่านศูนย์กลางเศรษฐกิจและชุมชนปทุมวัน'),
    ('เขตจตุจักร (กรุงเทพฯ)', 'BKK-CJC', 'พื้นที่ชุมชนและการขนส่งจตุจักร'),
    ('เทศบาลนครเชียงใหม่', 'CNX-CITY', 'พื้นที่ตัวเมืองและชุมชนรอบคูเมืองเชียงใหม่')
ON CONFLICT (name) DO NOTHING;
