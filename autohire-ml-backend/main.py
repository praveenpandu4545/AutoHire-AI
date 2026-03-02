from fastapi import FastAPI
from routers.eligibility import router as eligibility_router

app = FastAPI()

# Register routers
app.include_router(eligibility_router)

@app.get("/")
def root():
    return {"message": "AutoHire ML Service Running 🚀"}