create database saecomp;

\c saecomp

create type user_role as enum ('admin','user');
create type evaluation_status as enum ('approved', 'rejected', 'pending');
create type answer_type as enum ('numeric','text');


create table teachers (
    id serial primary key,
    name text not null,
    department text,
    institute text
);

create table courses (
    id serial primary key,
    name text not null,
    code text not null
);

create table teachers_courses (
    id serial primary key,
    teacher_id int not null references teachers(id) on delete cascade,
    course_id int not null references courses(id) on delete cascade,
    semester varchar(7) not null,
    ideal_year int,
    unique (teacher_id, course_id, semester),
    check (semester ~ '^[0-9]{4}-(1|2)$')
);

create table if not exists users (
    id serial primary key,
    google_sub text not null unique,
    name text,
    email text not null,
    role text check (role in ('admin', 'user')) default 'user',
    nusp varchar(10) unique,
    created_at timestamp with time zone default now()
);

create table if not exists sessions (
    id serial primary key,
    user_id integer not null references users(id) on delete cascade,
    token_hash text not null,
    issued_at timestamp with time zone default now(),
    expires_at timestamp with time zone,
    revoked boolean default false
);

create index if not exists idx_sessions_user_id on sessions(token_hash);

create table questions (
    id serial primary key,
    question text not null,
    type answer_type not null,
    active boolean not null default true,
    question_order int,
    is_score boolean not null default false,
    check (not is_score or type = 'numeric')
);

create unique index questions_active_order_idx
    on questions(question_order)
    where active;

create table evaluations (
    id serial primary key,
    user_id int references users(id) on delete set null,
    teacher_id int not null references teachers(id),
    course_id int not null references courses(id),
    score numeric(4,2),
    created_at timestamptz not null default now(),
    status evaluation_status not null default 'pending',
    approved_by int references users(id) on delete set null
);

create table answers (
    id serial primary key,
    evaluation_id int not null references evaluations(id) on delete cascade,
    question_id int not null references questions(id) on delete restrict,
    question_order int,
    answer text,
    edited_answer text,
    edited_by int references users(id) on delete set null
);


create index idx_evaluations_teacher_course_status
    on evaluations(teacher_id, course_id, status);

create index idx_answers_evaluation
    on answers(evaluation_id);


insert into users (google_sub, name, email, role)
values ('107116055684502249614', 'saecomp', 'saecomp@usp.br', 'admin');
