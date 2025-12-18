package com.talent_tandem.daoImpl;
import com.talent_tandem.dao.*;
import com.talent_tandem.model.*;
import com.talent_tandem.repository.*;
import com.talent_tandem.requestdto.*;
import com.talent_tandem.responsedto.*;
import org.springframework.stereotype.Component;

@Component
public class AdminDaoImpl implements IAdminDao {

    private final IUserRepo repo;

    public AdminDaoImpl(IUserRepo repo) {
        this.repo = repo;
    }

    @Override
    public User addAdmin(User user) {
        return repo.save(user);
    }
}
