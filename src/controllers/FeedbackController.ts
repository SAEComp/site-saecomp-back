import { Request, Response } from "express";
import { addDoc, collection, query, where, getDocs, updateDoc, doc, serverTimestamp, getCountFromServer, collectionGroup} from "firebase/firestore";
import { db } from "../../config/db/firebase_con";

/*
exemplo de requisicao de criacao
{
    "user": "fulano",
    "teacher": "fosorio",
    "course": "icc1",
    "rating": 4,
    "text": "muito ruim"
}

exemplo de requisicao de edicao
{
    "id": "1234",
    "rating": 5,
    "text": "ok"
}

exemplo de requisicao de exclusao
{
    "id": "1234",
}
*/

//melhorar a tipagem do código

//IDEIAS
//para criar periodos de avaliacao
//criar nova colecao aux no db q possui doc chamado "feedback_period" que teria tres campos: "open"(boleano), "init"(Timestamp) e "end" (Timestamp)
//ao fazer operacoes, checar se open == true. init e end servem para abrir e encerrar automaticamente o periodo e mudar open para false
//desvatagem: nao guarda quais foram os periodos passados de avaliacao
//OPCAO 2
//criar um novo documento "feedback_period" para cada novo periodo de avaliacao aberto
//id aleatorio, mesmos tres campos, haveria somente um doc com open == true por vez, entao fazer query buscando esse 
//desvantagem: mais trabalho pra mim kkk

//!!! IDEIA INTELIGENTE !!!
//Atualmente no db, há uma coleção de feedbacks para cada professor mas acredito que essa seja uma maneira burra de organização
//seria mais sensato ter uma única pasta reunindo todos os feedbacks (os quais já gravam prof e disciplina) e na hora de dar
//getfeedback basta filtrar pelo curso e/ou disciplina na requisição, isso facilitaria também as requisições de 
//update e delete, que atualmente pedem o prof na requisição e com essa modificação pediriam somente o id do feedback. Para
//mostrar a nota do prof também, bastaria filtrar pelo prof todos os feedbacks. Único problema que vejo é como armazenar a
//descrição do professor, mas sinceramente, ela é necessária?

//CALCULAR NOTA DO PROFESSOR SOMENTE QUANDO FOR PEDIDO EM UMA REQUEST

//!!! OUTRO PROBLEMA !!!
//Como exibir para o usuário somente os profs dos quais temos aula e como mostrar somente as matérias as quais esse professor
//dá aula? armazenar isso em outra coleção do db?

export async function createFeedback(req: Request, res: Response) {
    try {
        const colRef = collection(db, "feedback");

        //por enquanto o aluno so faz uma avaliacao por disciplina uma unica vez
        //fazer limitacao de uma avaliacao por semestre (periodo de avalicao)
        const userId: string = req.body.user;
        const q = query(colRef, where("user", "==", `${userId}`), where("deleted", "==", false));
        const querySnapshot = getCountFromServer(q);
        const numberOfFeedbacks = (await querySnapshot).data().count;

        if(numberOfFeedbacks < 1) 
        {
            await addDoc(colRef, {
                user: req.body.user,
                teacher: req.body.teacher,
                course: req.body.course,
                text: req.body.text,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                deleted: false
            });

            return res.status(201).send("Avaliação criada com sucesso!");
        }
        else 
        {
            return res.status(200).send("Usuário já avaliou este professor/curso.");
        }
        
    } catch (error) {
        console.log(error);
        return res.status(400).send("Deu ruim");
    }
}

export async function updateFeedback(req: Request, res: Response) {
    try {
        const docId:string = req.body.id;
        const docRef = doc(db, "feedback", `${docId}`);

        //o usuario poderá editar avaliacaos apenas do periodo atual (semestre) de avaliacao
        
        await updateDoc(docRef, {
            rating: req.body.rating,
            text: req.body.text,
            updatedAt: serverTimestamp()
        });

        return res.status(201).send("Avaliação editada com sucesso!");
    } catch (error) {
        console.log(error)
        return res.status(400).send("Não foi possível concluir a edição.");
    }
}

export async function deleteFeedback(req: Request, res: Response) {
    try {
        const docId:string = req.body.id;
        const docRef = doc(db, "feedback", `${docId}`);

        await updateDoc(docRef, {
            deleted: true,
            deletedAt: serverTimestamp()
        });

        return res.status(200).send("Remoção concluída com sucesso!")
    } catch (error) {
        console.log(error);
        return res.status(400).send("Não foi possível concluir a remoção.");
    }
}

export async function getFeedbackByTeacher(req: Request, res: Response) {
    try {
        const data: any = []; //melhorar a tipagem disso
        //criar um tipo para feedback
        const teacherName: string = req.body.teacher;
        //const colRef = collectionGroup(db, "feedback");
        const colRef = collection(db, "feedback");

        const q = query(colRef, where("teacher", "==", `${teacherName}`), where("deleted", "==", false));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            data.push({"id" : doc.id, "data" : doc.data()});
        });
            
        return res.status(200).send(data);
    } catch (error) {
        console.log(error);
        return res.status(400).send("Erro ao recuperar avaliações.");
    }
}

export async function getFeedbackByTeacherByCourse(req: Request, res: Response) {
    try {
        const data: any = []; //melhorar a tipagem disso
        //criar um tipo para feedback
        const teacherName: string = req.body.teacher;
        const courseName: string = req.body.course;
        //const colRef = collectionGroup(db, "feedback");
        const colRef = collection(db, "feedback");

        const q = query(colRef, where("teacher", "==", `${teacherName}`), where("course", "==", `${courseName}`), where("deleted", "==", false));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            data.push({"id" : doc.id, "data" : doc.data()});
        });
            
        return res.status(200).send(data);
    } catch (error) {
        console.log(error);
        return res.status(400).send("Erro ao recuperar avaliações.");
    }
}

export async function getFeedbackByUser(req: Request, res: Response) {
    try {
        const data: any = [];

        const userId: string = req.body.user;
        //const colRef = collectionGroup(db, "feedback");
        const colRef = collection(db, "feedback");

        const q = query(colRef, where("user", "==", `${userId}`), where("deleted", "==", false));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            data.push({"id" : doc.id, "data" : doc.data()});
        });
            
        return res.status(200).send(data);
    } catch (error) {
        console.log(error);
        return res.status(400).send("Erro ao recuperar avaliações.");
    }
}

async function updateRating(teacherName: string) {
    try {
        const data: any = [];

        //const colRef = collectionGroup(db, "feedback");
        const colRef = collection(db, "feedback");
        
        const q = query(colRef, where("teacher", "==", `${teacherName}`), where("deleted", "==", false));
        const querySnapshot = await getDocs(q);
        
        let rating: number = 0;

        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        });

        for (let i = 0; i < data.length; i++) {
            //console.log("atual rating: ", rating);
            //console.log("data[i] rating: ", data[i].rating);
            rating += data[i].rating;
            //console.log("rating poś-soma: ", rating);
        }

        return rating = rating/data.length;

    } catch (error) {
        console.log(error);
    }
}