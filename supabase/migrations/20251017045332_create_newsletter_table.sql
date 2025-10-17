CREATE TABLE public.newsletter (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email_hash text NOT NULL DEFAULT ''::text UNIQUE,
  email_encrypted text NOT NULL DEFAULT ''::text UNIQUE,
  CONSTRAINT newsletter_pkey PRIMARY KEY (id)
);

-- RLS
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;

-- policy
create policy "Allow insert newslatter email"
on "public"."newsletter"
as PERMISSIVE
for INSERT
to public
with check (
true
);